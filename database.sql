--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.6 (Ubuntu 10.6-0ubuntu0.18.04.1)

-- Started on 2019-02-08 22:30:31 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 13041)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- TOC entry 2963 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- TOC entry 223 (class 1255 OID 17315)
-- Name: fill_formular_from_json(json); Type: FUNCTION; Schema: public; Owner: meliha
--

CREATE FUNCTION public.fill_formular_from_json(in_json json) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
novi jsonb := (in_json)::jsonb;

BEGIN

 IF NOT EXISTS (SELECT elementid FROM textbox WHERE elementid IN ( SELECT (rec->>'elementId')::int FROM  jsonb_array_elements(novi->'element')rec)) THEN

  INSERT INTO textbox (elementid, value)(SELECT elementid, (rec->>'value')::text FROM element, jsonb_array_elements(novi->'element')rec WHERE elementid = (rec->>'elementId')::int AND (rec->>'elementType')::text = 'Textbox'); 

 ELSE 
  UPDATE textbox SET value = (rec->>'value')::text FROM jsonb_array_elements(novi->'element')rec WHERE elementid = (rec->>'elementId')::int;

 END IF;

 
 IF NOT EXISTS (SELECT elementid FROM checkbox WHERE elementid IN ( SELECT (rec->>'elementId')::int FROM  jsonb_array_elements(novi->'element')rec)) THEN

 INSERT INTO checkbox (elementid, value)(SELECT elementid, (rec->>'value')::boolean FROM element, jsonb_array_elements(novi->'element')rec WHERE elementid = (rec->>'elementId')::int AND (rec->>'elementType')::text = 'Checkbox');

 ELSE 

 UPDATE checkbox SET value = (rec->>'value')::boolean FROM jsonb_array_elements(novi->'element')rec WHERE elementid = (rec->>'elementId')::int;

 END IF;

 
 IF NOT EXISTS (SELECT elementid FROM radiobutton WHERE elementid IN ( SELECT (rec->>'elementId')::int FROM  jsonb_array_elements(novi->'element')rec)) THEN

 INSERT INTO radiobutton (value)
	(SELECT (jsonb_array_elements(rec->'buttons')->>'value')::boolean
	FROM radiobutton, jsonb_array_elements(novi->'element') rec
	WHERE elementid = (rec->>'elementId')::int
	AND buttonid = (jsonb_array_elements(rec->'buttons')->>'id')::int);

 ELSE 
 
  UPDATE radiobutton
  SET value = subquery.val
  FROM (SELECT (jsonb_array_elements(rec->'buttons')->>'value')::boolean AS val, (jsonb_array_elements(rec->'buttons')->>'id')::int AS id
	FROM jsonb_array_elements(novi->'element') rec) AS subquery
	WHERE radiobutton.buttonid = subquery.id;
END IF;

 END
$$;


ALTER FUNCTION public.fill_formular_from_json(in_json json) OWNER TO meliha;

--
-- TOC entry 218 (class 1255 OID 17183)
-- Name: get_filled_formular_from_db(text, integer); Type: FUNCTION; Schema: public; Owner: meliha
--

CREATE FUNCTION public.get_filled_formular_from_db(name text, ver integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
json1 JSON;
json2 JSON;
json3 JSON;
json4 JSON;
newId int;
oldId int;

BEGIN

 SELECT json_agg(json_build_object('elementid', element.elementid, 'elementtype', elementtype, 'label', label, 'validation', validation, 'value', value)) INTO json1 FROM element INNER JOIN textbox ON element.elementid = textbox.elementid INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND formular.version = ver AND element.elementtype = 'Textbox';

 SELECT json_agg(json_build_object('elementid', element.elementid, 'elementtype', elementtype, 'label', label, 'validation', validation, 'value', value)) INTO json2 FROM element INNER JOIN checkbox ON element.elementid = checkbox.elementid INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND formular.version = ver AND element.elementtype = 'Checkbox';

 SELECT json_agg(json_build_object('elementid', element.elementid, 'elementtype', elementtype, 'label', label, 'validation', validation, 'value', NULL)) INTO json3 FROM element INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND formular.version = ver AND element.elementtype = 'Radio buttons';

 IF EXISTS (SELECT radiobutton.elementid FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND formular.version = ver)
 THEN 
 SELECT json_agg(json_build_object('buttongroupid', radiobutton.elementid, 'buttonlabel', buttonlabel,'buttonid', buttonid,'buttonvalue', value, 'buttonid', buttonid)) INTO json4 FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND version = ver;

 END IF;

IF json1::jsonb IS NULL AND json2::jsonb IS NULL AND json3::jsonb IS NULL  THEN

IF NOT EXISTS (SELECT formularid FROM formular WHERE formularname = '"' || name || '"' AND version = ver) THEN
INSERT INTO formular(formularname, version) VALUES ('"' || name || '"', ver);

SELECT formularid INTO newId FROM formular WHERE formularname = '"' || name || '"' AND version = ver; 
SELECT formularid INTO oldId FROM formular WHERE formularname = '"' || name || '"' AND version = 0; 

INSERT INTO element (formularid, elementtype, label, validation)
(SELECT newId, elementtype, label, validation FROM element INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND version = 0);

INSERT INTO radiobutton (elementid, buttonlabel) 
(SELECT other.elementid, buttonlabel FROM element AS other, element AS one, radiobutton 
WHERE other.elementid != one.elementid 
AND other.label = one.label
AND radiobutton.elementid = one.elementid
AND one.formularid = oldId
AND other.formularid = newId);

END IF;

SELECT json_agg(json_build_object('elementid', elementid, 'elementtype', elementtype, 'label', label, 'validation', validation, 'value', NULL)) INTO json1 FROM element INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND version = ver ;
IF EXISTS (SELECT radiobutton.elementid FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND version = ver)
THEN 
SELECT json_agg(json_build_object('buttongroupid', radiobutton.elementid, 'buttonlabel', buttonlabel, 'buttonid', buttonid, 'buttonvalue', NULL)) INTO json2  FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND version = ver;

RETURN json1::jsonb || json2::jsonb;

ELSE
 RETURN json1::jsonb;
END IF;
END IF;

IF json1::jsonb IS NOT NULL AND json2::jsonb IS NULL AND json3::jsonb IS NULL  THEN
 RETURN  json1::jsonb;
END IF;

IF json1::jsonb IS NULL AND json2::jsonb IS NOT NULL AND json3::jsonb IS NULL THEN
 RETURN  json2::jsonb;
END IF;

IF json1::jsonb IS NULL AND json2::jsonb IS NULL AND json3::jsonb IS NOT NULL THEN
 RETURN  json3::jsonb || json4::jsonb;
END IF;

IF json1::jsonb IS NOT NULL AND json2::jsonb IS NOT NULL AND json3::jsonb IS NULL THEN
 RETURN  json1::jsonb || json2::jsonb;
END IF;

IF json1::jsonb IS NOT NULL AND json2::jsonb IS NULL AND json3::jsonb IS NOT NULL THEN
 RETURN  json1::jsonb || json3::jsonb || json4::jsonb;
 END IF;

IF json1::jsonb IS NULL AND json2::jsonb IS NOT NULL AND json3::jsonb IS NOT NULL THEN
 RETURN  json2::jsonb || json3::jsonb || json4::jsonb;
 
ELSE
 RETURN json1::jsonb || json2::jsonb || json3::jsonb || json4::jsonb;
END IF;

 END
$$;


ALTER FUNCTION public.get_filled_formular_from_db(name text, ver integer) OWNER TO meliha;

--
-- TOC entry 221 (class 1255 OID 17188)
-- Name: get_filled_formular_from_db(text, text); Type: FUNCTION; Schema: public; Owner: meliha
--

CREATE FUNCTION public.get_filled_formular_from_db(name text, ver text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
json1 JSON;
json2 JSON;
json3 JSON;
json4 JSON;

BEGIN

 SELECT json_agg(json_build_object('elementid', elementid, 'elementtype', elementtype, 'label', label, 'validation', validation, 'value', value)) INTO json1 FROM element, textbox, formular WHERE element.formularid = formular.formularid AND formularname = '"' || name || '"' AND formular.version = ver AND element.elementtype = 'Textbox' AND textbox.elementid = element.elementid;

 SELECT json_agg(json_build_object('elementid', elementid, 'elementtype', elementtype, 'label', label, 'validation', validation, 'value', value)) INTO json2 FROM element, checkbox, formular WHERE element.formularid = formular.formularid AND formularname = '"' || name || '"' AND formular.version = ver AND element.elementtype = 'Checkbox'  AND checkbox.elementid = element.elementid ;

 SELECT json_agg(json_build_object('elementid', elementid, 'elementtype', elementtype, 'label', label, 'validation', validation)) INTO json3 FROM element, formular WHERE element.formularid = formular.formularid AND formularname = '"' || name || '"' AND formular.version = ver AND element.elementtype = 'Radio buttons';

IF EXISTS (SELECT radiobutton.elementid FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND formular.version = ver)
THEN 
SELECT json_agg(json_build_object('buttongroupid', radiobutton.elementid, 'buttonlabel', buttonlabel,'buttonvalue', value, 'buttonid', buttonid) INTO json4 )FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"';
 END IF;

IF json1::jsonb <> NULL AND json2::jsonb = NULL AND json3 = NULL  THEN
 RETURN  json1::jsonb;
END IF;

IF json1::jsonb = NULL AND json2::jsonb <> NULL AND json3 = NULL THEN
 RETURN  json2::jsonb;
END IF;

IF json1::jsonb = NULL AND json2::jsonb = NULL AND json3 <> NULL THEN
 RETURN  json3::jsonb || json4::jsonb;
END IF;

IF json1::jsonb <> NULL AND json2::jsonb <> NULL AND json3 = NULL THEN
 RETURN  json1::jsonb || json2::jsonb;
END IF;

IF json1::jsonb <> NULL AND json2::jsonb = NULL AND json3 <> NULL THEN
 RETURN  json1::jsonb || json3::jsonb || json4::jsonb;
END IF;

IF json1::jsonb = NULL AND json2::jsonb <> NULL AND json3 <> NULL THEN
 RETURN  json2::jsonb || json3::jsonb || json4::jsonb;
ELSE
 RETURN json1::jsonb || json2::jsonb || json3::jsonb || json4::jsonb;
END IF;
 
 END
$$;


ALTER FUNCTION public.get_filled_formular_from_db(name text, ver text) OWNER TO meliha;

--
-- TOC entry 220 (class 1255 OID 18349)
-- Name: get_from_db(text); Type: FUNCTION; Schema: public; Owner: meliha
--

CREATE FUNCTION public.get_from_db(name text) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
json1 JSON;
json2 JSON;

BEGIN
 SELECT json_agg(json_build_object('elementid', elementid, 'elementtype', elementtype, 'label', label, 'validation', validation)) INTO json1 FROM element, formular WHERE element.formularid = formular.formularid AND formularname = '"' || name || '"' AND version = 0;
IF EXISTS (SELECT radiobutton.elementid FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND version = 0)
THEN 
SELECT json_agg(json_build_object('buttongroupid', radiobutton.elementid, 'buttonlabel', buttonlabel, 'buttonid', buttonid) INTO json2 )FROM radiobutton INNER JOIN element ON element.elementid = radiobutton.elementid  INNER JOIN formular ON element.formularid = formular.formularid WHERE formularname = '"' || name || '"' AND version = 0;
 RETURN json1::jsonb || json2::jsonb;

 ELSE
 RETURN  json1::jsonb;
 END IF;
 END
$$;


ALTER FUNCTION public.get_from_db(name text) OWNER TO meliha;

--
-- TOC entry 219 (class 1255 OID 18348)
-- Name: insert_from_json(json); Type: FUNCTION; Schema: public; Owner: meliha
--

CREATE FUNCTION public.insert_from_json(in_json json) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
id int;
elemid int[];
i int;

BEGIN

 IF NOT EXISTS ( SELECT formularname FROM formular WHERE formularname = (in_json->'formularName')::text) THEN
   INSERT INTO formular(formularname,version) VALUES (in_json->'formularName', 0);
  END IF;
   
  SELECT formular.formularid INTO id FROM formular WHERE formularname = (in_json->'formularName')::text AND version = 0;

  DELETE FROM element WHERE formularid = id;
  
  INSERT INTO element (formularid, elementtype, label, validation)
  SELECT id, (rec->>'type')::text, (rec->>'label')::text, (rec->>'validation')::text FROM json_array_elements(in_json->'element') rec;

  INSERT INTO radiobutton (elementid, buttonlabel) 
  SELECT element.elementid, (json_array_elements(rec->'rbLabels')->>'rLabel')::text 
  FROM element, json_array_elements(in_json->'element') rec 
  WHERE element.elementtype = 'Radio buttons' AND element.formularid = id AND element.label = (rec->>'label')::text ;

END
$$;


ALTER FUNCTION public.insert_from_json(in_json json) OWNER TO meliha;

--
-- TOC entry 204 (class 1259 OID 17159)
-- Name: checkbox; Type: TABLE; Schema: public; Owner: meliha
--

CREATE TABLE public.checkbox (
    elementid integer NOT NULL,
    value boolean
);


ALTER TABLE public.checkbox OWNER TO meliha;

--
-- TOC entry 201 (class 1259 OID 16890)
-- Name: element; Type: TABLE; Schema: public; Owner: meliha
--

CREATE TABLE public.element (
    elementid integer NOT NULL,
    formularid integer,
    elementtype text,
    label text,
    validation text
);


ALTER TABLE public.element OWNER TO meliha;

--
-- TOC entry 200 (class 1259 OID 16888)
-- Name: element_elementid_seq; Type: SEQUENCE; Schema: public; Owner: meliha
--

CREATE SEQUENCE public.element_elementid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.element_elementid_seq OWNER TO meliha;

--
-- TOC entry 2964 (class 0 OID 0)
-- Dependencies: 200
-- Name: element_elementid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: meliha
--

ALTER SEQUENCE public.element_elementid_seq OWNED BY public.element.elementid;


--
-- TOC entry 198 (class 1259 OID 16874)
-- Name: formular; Type: TABLE; Schema: public; Owner: meliha
--

CREATE TABLE public.formular (
    formularid integer NOT NULL,
    formularname text,
    version integer
);


ALTER TABLE public.formular OWNER TO meliha;

--
-- TOC entry 199 (class 1259 OID 16877)
-- Name: formular_formularid_seq; Type: SEQUENCE; Schema: public; Owner: meliha
--

CREATE SEQUENCE public.formular_formularid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.formular_formularid_seq OWNER TO meliha;

--
-- TOC entry 2965 (class 0 OID 0)
-- Dependencies: 199
-- Name: formular_formularid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: meliha
--

ALTER SEQUENCE public.formular_formularid_seq OWNED BY public.formular.formularid;


--
-- TOC entry 203 (class 1259 OID 16899)
-- Name: radiobutton; Type: TABLE; Schema: public; Owner: meliha
--

CREATE TABLE public.radiobutton (
    elementid integer,
    buttonid integer NOT NULL,
    buttonlabel text,
    value boolean
);


ALTER TABLE public.radiobutton OWNER TO meliha;

--
-- TOC entry 202 (class 1259 OID 16897)
-- Name: radiobutton_buttonid_seq; Type: SEQUENCE; Schema: public; Owner: meliha
--

CREATE SEQUENCE public.radiobutton_buttonid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.radiobutton_buttonid_seq OWNER TO meliha;

--
-- TOC entry 2966 (class 0 OID 0)
-- Dependencies: 202
-- Name: radiobutton_buttonid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: meliha
--

ALTER SEQUENCE public.radiobutton_buttonid_seq OWNED BY public.radiobutton.buttonid;


--
-- TOC entry 205 (class 1259 OID 17558)
-- Name: textbox; Type: TABLE; Schema: public; Owner: meliha
--

CREATE TABLE public.textbox (
    elementid integer NOT NULL,
    value text
);


ALTER TABLE public.textbox OWNER TO meliha;

--
-- TOC entry 2819 (class 2604 OID 16893)
-- Name: element elementid; Type: DEFAULT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.element ALTER COLUMN elementid SET DEFAULT nextval('public.element_elementid_seq'::regclass);


--
-- TOC entry 2818 (class 2604 OID 16879)
-- Name: formular formularid; Type: DEFAULT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.formular ALTER COLUMN formularid SET DEFAULT nextval('public.formular_formularid_seq'::regclass);


--
-- TOC entry 2820 (class 2604 OID 16902)
-- Name: radiobutton buttonid; Type: DEFAULT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.radiobutton ALTER COLUMN buttonid SET DEFAULT nextval('public.radiobutton_buttonid_seq'::regclass);


--
-- TOC entry 2828 (class 2606 OID 17163)
-- Name: checkbox checkbox_pkey; Type: CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.checkbox
    ADD CONSTRAINT checkbox_pkey PRIMARY KEY (elementid);


--
-- TOC entry 2824 (class 2606 OID 16904)
-- Name: element element_pkey; Type: CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.element
    ADD CONSTRAINT element_pkey PRIMARY KEY (elementid);


--
-- TOC entry 2822 (class 2606 OID 16887)
-- Name: formular formular_pkey; Type: CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.formular
    ADD CONSTRAINT formular_pkey PRIMARY KEY (formularid);


--
-- TOC entry 2826 (class 2606 OID 16911)
-- Name: radiobutton radiobutton_pkey; Type: CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.radiobutton
    ADD CONSTRAINT radiobutton_pkey PRIMARY KEY (buttonid);


--
-- TOC entry 2830 (class 2606 OID 17565)
-- Name: textbox textbox_pkey; Type: CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.textbox
    ADD CONSTRAINT textbox_pkey PRIMARY KEY (elementid);


--
-- TOC entry 2833 (class 2606 OID 17164)
-- Name: checkbox checkbox_elementid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.checkbox
    ADD CONSTRAINT checkbox_elementid_fkey FOREIGN KEY (elementid) REFERENCES public.element(elementid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2831 (class 2606 OID 16905)
-- Name: element element_formularid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.element
    ADD CONSTRAINT element_formularid_fkey FOREIGN KEY (formularid) REFERENCES public.formular(formularid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2832 (class 2606 OID 16930)
-- Name: radiobutton radiobutton_elementid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.radiobutton
    ADD CONSTRAINT radiobutton_elementid_fkey FOREIGN KEY (elementid) REFERENCES public.element(elementid) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2834 (class 2606 OID 17566)
-- Name: textbox textbox_elementid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: meliha
--

ALTER TABLE ONLY public.textbox
    ADD CONSTRAINT textbox_elementid_fkey FOREIGN KEY (elementid) REFERENCES public.element(elementid) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2019-02-08 22:30:31 CET

--
-- PostgreSQL database dump complete
--


SET search_path TO homonet, public;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE homonet.subject_guarantor
TO homonet_app_auth;
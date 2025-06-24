ALTER TABLE auth.users
ADD CONSTRAINT "check_email_domain"
CHECK (email ~* '^[a-zA-Z0-9._%+-]+@avito\.ru$'); 
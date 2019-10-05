create table ttbl1 (id serial primary key, value text);
insert into ttbl1 (value) values ('test1 value');

create user testuser1 with password 'user1pass';
grant all privileges on database test1 to testuser1;

grant select, insert, update, delete on all tables in schema public to testuser1;
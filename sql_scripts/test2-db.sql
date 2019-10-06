create table ttbl2 (id serial primary key, value text);
alter table ttbl2 add column updated_at timestamp default current_timestamp;
insert into ttbl2 (value) values ('test2 value'), ('another test value'), ('a third value');
delete from ttb2 where id = 3;
insert into ttbl2 (value) values ('a value goes here');

create user testuser2 with password 'user2pass';
grant all privileges on database test2 to testuser2;

grant select, insert, update, delete on all tables in schema public to testuser2;
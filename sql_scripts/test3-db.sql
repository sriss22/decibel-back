create table ttbl3 (id serial primary key, value text, created_at timestamp default current_timestamp, updated_at timestamp default current_timestamp);

create user testuser3 with password 'user3pass';
grant all privileges on database test3 to testuser3;

grant select, insert, update, delete on all tables in schema public to testuser3;
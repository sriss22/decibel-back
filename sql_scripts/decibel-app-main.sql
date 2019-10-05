create table connections (
	id serial primary key,
	host varchar(256) not null,
	database varchar(128) not null,
	port integer not null,
	username varchar(128) not null,
	password varchar(128) not null
);

insert into connections 
	(host, database, port, username, password) 
values 
	('localhost', 'test1', 5432, 'testuser1', 'user1pass'),
	('localhost', 'test2', 5432, 'testuser2', 'user2pass'),
	('localhost', 'test3', 5432, 'testuser3', 'user3pass');
	
select * from connections;

-- user: decibel, pass: admin1234
create user decibel with password 'admin1234';
grant all privileges on database "decibel-app" to decibel;

grant select, insert, update, delete on all tables in schema public to decibel;
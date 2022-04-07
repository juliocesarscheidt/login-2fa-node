create table `user_system`.`users` (
  id int auto_increment PRIMARY KEY,
  username varchar(255),
  email varchar(255) UNIQUE KEY,
  password varchar(255),
  2fa_secret varchar(255)
);

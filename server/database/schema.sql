DROP DATABASE IF EXISTS sequencer;
CREATE DATABASE sequencer;
USE sequencer;

CREATE TABLE sequences (
  id INT AUTO_INCREMENT,
  seq TEXT,
  author VARCHAR(32),
  title VARCHAR(32),
  PRIMARY KEY (id)
);
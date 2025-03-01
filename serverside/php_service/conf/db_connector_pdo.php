<?php

class DBConnectorPDO{

    private $servername = "[db_server]";
    private $username = "[db_user]";
    private $password = "[db_password]";
    private $dbname = "[db_name]";
    private $port = "[db_port]";
    private $conn = null;
    private $connected = false;
    private static $instance = null;


     private function __construct(){
        $this->connect();
      }
     private function connect(){
        try {
            //////////////////////////////////////
            //$this->conn = new PDO('pgsql:host='.$this->servername.';dbname='.$this->dbname, $this->username, $this->password);
            $this->conn = new PDO('pgsql:host='.$this->servername.';dbname='.$this->dbname, $this->username, $this->password, array(PDO::ATTR_PERSISTENT => true));
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->connected = true;


        } catch (PDOException $e) {
           die("DB connection error: ".$e->getMessage());
           $this->conn = null;
           $this->connected = false;
        }
     }

     public static function getInstance(){
        if(!self::$instance){
          self::$instance = new DBConnectorPDO();
        }
        return self::$instance;
     }

     public function connection(){
        if ($this->connected == false) {
            $this->connect();
            return $this->conn;
        }else {
            return $this->conn;
        }
     }

}

?>

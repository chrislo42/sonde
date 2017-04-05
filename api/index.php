<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';
require 'config.php';

spl_autoload_register(function ($classname) {
    require ("../classes/" . $classname . ".php");
});

$config['displayErrorDetails'] = true;
$config['addContentLengthHeader'] = false;

$config['db']['host']   = DB_HOST;
$config['db']['user']   = DB_USER;
$config['db']['pass']   = DB_PASSWD;
$config['db']['dbname'] = DB_NAME;

$app = new \Slim\App(["settings" => $config]);

$container = $app->getContainer();

$container['logger'] = function($c) {
    $logger = new \Monolog\Logger('my_logger');
    $file_handler = new \Monolog\Handler\StreamHandler("../logs/app.log");
    $logger->pushHandler($file_handler);
    return $logger;
};
$container['db'] = function ($c) {
    $db = $c['settings']['db'];
	try
    {
     	$pdo = new PDO("mysql:host=" . $db['host'] . ";dbname=" . $db['dbname'], $db['user'], $db['pass']);
    }
    catch (Exception $e)
    {
        die('Erreur : ' . $e->getMessage());
    }  
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    return $pdo;
};

$app->get('/hello/{name}', function (Request $request, Response $response) {
    $name = $request->getAttribute('name');
	$this->logger->addInfo("Something interesting happened");
    $response->getBody()->write("Hello, $name");

    return $response;
});

$app->get('/meas/last_html', function (Request $request, Response $response) {
	$req = $this->db->query('SELECT * FROM mesures ORDER BY date  DESC LIMIT 1');
    $donnees = $req->fetch();
	$temp = $donnees['temp'];
	$humid = $donnees['humid'];
    $req->closeCursor(); // Termine le traitement de la requête
	$this->logger->addInfo("get html last measure");
    $response->getBody()->write("Last measurement => température : $temp ; humidité : $humid");

    return $response;
});

$app->get('/meas/day/last', function (Request $request, Response $response) {
    $req = $this->db->query('SELECT * FROM mesures ORDER BY date  DESC LIMIT 1');
    $donnees = $req->fetch();
    $reponse = array('date'=> $donnees['date'], 'temp'=> $donnees['temp'], 'humid'=> $donnees['humid']);
    $req->closeCursor(); // Termine le traitement de la requête
    $this->logger->addInfo("get last measure");

    return json_encode($reponse);
});

$app->get('/meas/day/current', function (Request $request, Response $response) {
	$req = $this->db->prepare('SELECT * FROM mesures WHERE date  > ?');
	$date = date("Y-m-d")." 00:00:00";
    $req->execute(array($date));
    $listes = array();
    while ($donnees = $req->fetch()) {
        $listes[] = array('date'=> $donnees['date'], 'temp'=> $donnees['temp'], 'humid'=> $donnees['humid']);
    }
    $req->closeCursor(); // Termine le traitement de la requête
	$this->logger->addInfo("get current day measures");

    return json_encode($listes);
});

$app->get('/meas/day/{date}', function (Request $request, Response $response) {
    $date = $request->getAttribute('date');
    $date1 = $date." 00:00:00";
    $date2 = $date." 23:59:59";
    $req = $this->db->prepare('SELECT * FROM mesures WHERE date BETWEEN ? AND ?');
    $req->execute(array($date1, $date2));
    $listes = array();
    while ($donnees = $req->fetch()) {
        $listes[] = array('date'=> $donnees['date'], 'temp'=> $donnees['temp'], 'humid'=> $donnees['humid']);
    }
    $req->closeCursor(); // Termine le traitement de la requête
    $this->logger->addInfo("get given day measures");

    return json_encode($listes);
});

$app->get('/meas/days/{date1}/{date2}', function (Request $request, Response $response) {
    $date1 = $request->getAttribute('date1')." 00:00:00";
    $date2 = $request->getAttribute('date2')." 23:59:59";
    $req = $this->db->prepare('SELECT * FROM mesures WHERE date BETWEEN ? AND ?');
    $req->execute(array($date1, $date2));
    $listes = array();
    while ($donnees = $req->fetch()) {
        $listes[] = array('date'=> $donnees['date'], 'temp'=> $donnees['temp'], 'humid'=> $donnees['humid']);
    }
    $req->closeCursor(); // Termine le traitement de la requête
    $this->logger->addInfo("get interval days measures");

    return json_encode($listes);
});

$app->get('/meas/month/current', function (Request $request, Response $response) {
    $req = $this->db->prepare('SELECT * FROM mesures WHERE date  > ?');
    $date = date("Y-m")."-01 00:00:00";
    $req->execute(array($date));
    $listes = array();
    while ($donnees = $req->fetch()) {
        $listes[] = array('date'=> $donnees['date'], 'temp'=> $donnees['temp'], 'humid'=> $donnees['humid']);
    }
    $req->closeCursor(); // Termine le traitement de la requête
    $this->logger->addInfo("get current month measures");

    return json_encode($listes);
});

$app->get('/meas/month/{month1}', function (Request $request, Response $response) {
    $req = $this->db->prepare('SELECT * FROM mesures WHERE date BETWEEN ? AND ?');
    $date1 = $request->getAttribute('month1')."-01 00:00:00";
    $date2 = $request->getAttribute('month1')."-31 23:59:59";
    $req->execute(array($date1, $date2));
    $listes = array();
    while ($donnees = $req->fetch()) {
        $listes[] = array('date'=> $donnees['date'], 'temp'=> $donnees['temp'], 'humid'=> $donnees['humid']);
    }
    $req->closeCursor(); // Termine le traitement de la requête
    $this->logger->addInfo("get given month measures");

    return json_encode($listes);
});

$app->get('/meas/months/{month1}/{month2}', function (Request $request, Response $response) {
    $date1 = $request->getAttribute('month1')."-01 00:00:00";
    $date2 = $request->getAttribute('month2')."-31 23:59:59";
    $req = $this->db->prepare('SELECT * FROM mesures WHERE date BETWEEN ? AND ?');
    $req->execute(array($date1, $date2));
    $listes = array();
    while ($donnees = $req->fetch()) {
        $listes[] = array('date'=> $donnees['date'], 'temp'=> $donnees['temp'], 'humid'=> $donnees['humid']);
    }
    $req->closeCursor(); // Termine le traitement de la requête
    $this->logger->addInfo("get interval months measures");

    return json_encode($listes);
});

$app->post('/meas/new', function (Request $request, Response $response) {
	$data = $request->getParsedBody();
	$temp = $data['value1'];
	$humid = $data['value2'];
	$req = $this->db->prepare('INSERT INTO mesures (temp, humid) VALUES (?,?)');
	$req->execute(array($temp,$humid));
	$req->closeCursor(); // Termine le traitement de la requête
	$this->logger->addInfo("post new measures, temp : $temp humid : $humid");
    $response->getBody()->write("Get new measures !!! => temp : $temp; humid : $humid");

    return $response;
});

$app->run();

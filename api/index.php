<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';

spl_autoload_register(function ($classname) {
    require ("../classes/" . $classname . ".php");
});

$config['displayErrorDetails'] = true;
$config['addContentLengthHeader'] = false;

$config['db']['host']   = "localhost";
$config['db']['user']   = "slimapp";
$config['db']['pass']   = "access";
$config['db']['dbname'] = "nodemcu";

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

$app->get('/meas/last', function (Request $request, Response $response) {
	$req = $this->db->query('SELECT * FROM mesures ORDER BY date  DESC LIMIT 1');
    $donnees = $req->fetch();
	$temp = $donnees['temp'];
	$humid = $donnees['humid'];
    $req->closeCursor(); // Termine le traitement de la requête
	$this->logger->addInfo("get last measure");
    $response->getBody()->write("Last measurement => température : $temp ; humidité : $humid");

    return $response;
});

$app->get('/meas/last_json', function (Request $request, Response $response) {
	$req = $this->db->query('SELECT * FROM mesures ORDER BY date  DESC LIMIT 1');
    $donnees = $req->fetch();
	$temp = $donnees['temp'];
	$humid = $donnees['humid'];
    $req->closeCursor(); // Termine le traitement de la requête
	$this->logger->addInfo("get json last measure");
    $response = array('temp'=> $temp, 'humid'=> $humid);

    return json_encode($response);
});
$app->post('/meas/new', function (Request $request, Response $response) {
	$data = $request->getParsedBody();
	$temp = $data['value1'];
	$humid = $data['value2'];
	$req = $this->db->prepare('INSERT INTO mesures (temp, humid) VALUES (?,?)');
	$req->execute(array($temp,$humid));
	$req->closeCursor(); // Termine le traitement de la requête
	$this->logger->addInfo("post new measure, temp : $temp humid : $humid");
    $response->getBody()->write("New measurement !!!=> température : $temp; humidité : $humid");

    return $response;
});

$app->run();

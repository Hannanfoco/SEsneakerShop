<?php
/**
 * PHPUnit Bootstrap
 *
 * Loads the Composer autoloader and all DAO + Service files needed by tests.
 * This file is referenced in phpunit.xml via the bootstrap attribute.
 */

require_once __DIR__ . '/../vendor/autoload.php';

// DAO classes (mocked in tests, but PHPUnit needs the class name to exist)
require_once __DIR__ . '/../dao/BaseDao.php';
require_once __DIR__ . '/../dao/UserDao.php';
require_once __DIR__ . '/../dao/ProductDao.php';
require_once __DIR__ . '/../dao/CartDao.php';
require_once __DIR__ . '/../dao/FavouriteDao.php';
require_once __DIR__ . '/../dao/PaymentDao.php';

// Service classes under test
require_once __DIR__ . '/../service/BaseService.php';
require_once __DIR__ . '/../service/UserService.php';
require_once __DIR__ . '/../service/ProductService.php';
require_once __DIR__ . '/../service/CartService.php';
require_once __DIR__ . '/../service/FavoritesService.php';
require_once __DIR__ . '/../service/PaymentService.php';

# SneakerShop – Backend Unit Tests

## Overview

Five test classes covering the main application functionalities:

| Test file | Service tested | Functionalities covered |
|---|---|---|
| `UserServiceTest.php` | `UserService` | Registration, duplicate-email check, missing fields, login, wrong password, non-existent user, admin role check |
| `ProductServiceTest.php` | `ProductService` | Get all, get by id, keyword search, search with no results, filter by brand, filter by price |
| `CartServiceTest.php` | `CartService` | Add new item to cart, update quantity when item already in cart, get user cart, update cart item quantity, remove item |
| `FavouriteServiceTest.php` | `FavouriteService` | Add to favourites, duplicate favourite prevention, get favourites, empty favourites, remove from favourites |
| `PaymentServiceTest.php` | `PaymentService` | Create payment (successful/pending), get payment by id, get all payments, delete payment |

## Setup

Install PHPUnit (only needed once):

```bash
cd backend
composer install
```

## Running the tests

```bash
cd backend
./vendor/bin/phpunit
```

For a more readable output:

```bash
./vendor/bin/phpunit --testdox
```

To run a single test class:

```bash
./vendor/bin/phpunit tests/UserServiceTest.php
```

## Test design

All tests are **unit tests** – they do not connect to a real database.
Each service's DAO dependency is replaced with a PHPUnit mock object, so tests run in
isolation and are fast.

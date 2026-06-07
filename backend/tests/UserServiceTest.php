<?php

use PHPUnit\Framework\TestCase;

/**
 * Unit tests for UserService
 *
 * Tests cover:
 *   - Successful user registration
 *   - Duplicate email registration prevention
 *   - Missing required field validation
 *   - Successful login
 *   - Login with wrong password
 *   - Login with non-existent email
 *   - isAdmin role check
 */
class UserServiceTest extends TestCase
{
    private $userDaoMock;
    private $userService;

    protected function setUp(): void
    {
        // We mock UserDao so tests do not require a real database connection.
        $this->userDaoMock = $this->createMock(UserDao::class);

        // Instantiate UserService and inject the mock via reflection
        // (UserService creates its own dao in __construct, so we override it)
        require_once __DIR__ . '/../service/UserService.php';

        $this->userService = $this->getMockBuilder(UserService::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock();

        $reflection = new ReflectionClass($this->userService);
        $prop = $reflection->getProperty('userDao');
        $prop->setAccessible(true);
        $prop->setValue($this->userService, $this->userDaoMock);

        $daoProp = $reflection->getProperty('dao');
        $daoProp->setAccessible(true);
        $daoProp->setValue($this->userService, $this->userDaoMock);
    }

    // -----------------------------------------------------------------------
    // registerUser tests
    // -----------------------------------------------------------------------

    public function testRegisterUserSuccessfully(): void
    {
        $data = [
            'username' => 'johndoe',
            'email'    => 'john@example.com',
            'password' => 'Secret123!',
            'role'     => 'user',
        ];

        // Email does not exist yet
        $this->userDaoMock
            ->method('getByEmail')
            ->with('john@example.com')
            ->willReturn(null);

        // insert() returns a simulated newly-created user id
        $this->userDaoMock
            ->method('insert')
            ->willReturn(['id' => 1]);

        $result = $this->userService->registerUser($data);

        $this->assertNotNull($result, 'registerUser should return a result on success.');
    }

    public function testRegisterUserThrowsExceptionForDuplicateEmail(): void
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('User with this email already exists.');

        $data = [
            'username' => 'janedoe',
            'email'    => 'existing@example.com',
            'password' => 'Password1!',
            'role'     => 'user',
        ];

        // Simulate existing user
        $this->userDaoMock
            ->method('getByEmail')
            ->with('existing@example.com')
            ->willReturn(['id' => 5, 'email' => 'existing@example.com']);

        $this->userService->registerUser($data);
    }

    public function testRegisterUserThrowsExceptionForMissingField(): void
    {
        $this->expectException(Exception::class);

        // 'password' field is intentionally missing
        $data = [
            'username' => 'noemail',
            'email'    => 'test@example.com',
            'role'     => 'user',
        ];

        // getByEmail should not even be called in this case, but allow it to return null
        $this->userDaoMock->method('getByEmail')->willReturn(null);

        $this->userService->registerUser($data);
    }

    // -----------------------------------------------------------------------
    // login tests
    // -----------------------------------------------------------------------

    public function testLoginSuccessfully(): void
    {
        $plainPassword = 'MyPassword1!';
        $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);

        $storedUser = [
            'id'            => 1,
            'email'         => 'user@example.com',
            'password_hash' => $hashedPassword,
            'role'          => 'user',
        ];

        $this->userDaoMock
            ->method('getByEmail')
            ->with('user@example.com')
            ->willReturn($storedUser);

        $result = $this->userService->login('user@example.com', $plainPassword);

        $this->assertEquals($storedUser, $result, 'login() should return the user array on success.');
    }

    public function testLoginThrowsExceptionForWrongPassword(): void
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Invalid credentials.');

        $storedUser = [
            'id'            => 2,
            'email'         => 'user@example.com',
            'password_hash' => password_hash('CorrectPass1!', PASSWORD_DEFAULT),
            'role'          => 'user',
        ];

        $this->userDaoMock
            ->method('getByEmail')
            ->willReturn($storedUser);

        $this->userService->login('user@example.com', 'WrongPass999!');
    }

    public function testLoginThrowsExceptionForNonExistentUser(): void
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('User not found.');

        $this->userDaoMock
            ->method('getByEmail')
            ->willReturn(null);

        $this->userService->login('ghost@example.com', 'any');
    }

    // -----------------------------------------------------------------------
    // isAdmin tests
    // -----------------------------------------------------------------------

    public function testIsAdminReturnsTrueForAdminRole(): void
    {
        $adminUser = ['id' => 10, 'role' => 'admin'];
        $this->assertTrue($this->userService->isAdmin($adminUser));
    }

    public function testIsAdminReturnsFalseForRegularUser(): void
    {
        $regularUser = ['id' => 11, 'role' => 'user'];
        $this->assertFalse($this->userService->isAdmin($regularUser));
    }
}

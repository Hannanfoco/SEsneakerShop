<?php

use PHPUnit\Framework\TestCase;

/**
 * Unit tests for CartService
 *
 * Tests cover:
 *   - addToCart inserts a new item when product not in cart
 *   - addToCart updates quantity when product already in cart
 *   - getCartByUser returns all items for a user
 *   - updateCartItemQuantity delegates to dao update
 *   - removeItem delegates to dao delete
 */
class CartServiceTest extends TestCase
{
    private $cartDaoMock;
    private $cartService;

    protected function setUp(): void
    {
        require_once __DIR__ . '/../service/CartService.php';

        $this->cartDaoMock = $this->createMock(CartDao::class);

        $this->cartService = $this->getMockBuilder(CartService::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock();

        $reflection = new ReflectionClass($this->cartService);

        $cartDaoProp = $reflection->getProperty('cartDao');
        $cartDaoProp->setAccessible(true);
        $cartDaoProp->setValue($this->cartService, $this->cartDaoMock);

        $daoProp = $reflection->getProperty('dao');
        $daoProp->setAccessible(true);
        $daoProp->setValue($this->cartService, $this->cartDaoMock);
    }

    // -----------------------------------------------------------------------
    // addToCart tests
    // -----------------------------------------------------------------------

    public function testAddToCartInsertsNewItemWhenNotAlreadyInCart(): void
    {
        // Cart is currently empty for this user
        $this->cartDaoMock
            ->method('getUserCart')
            ->with(1)
            ->willReturn([]);

        $this->cartDaoMock
            ->expects($this->once())
            ->method('insert')
            ->with(['user_id' => 1, 'product_id' => 10, 'quantity' => 2])
            ->willReturn(['id' => 100]);

        $result = $this->cartService->addToCart(1, 10, 2);

        $this->assertNotNull($result);
    }

    public function testAddToCartUpdatesQuantityWhenItemAlreadyInCart(): void
    {
        $existingCartItems = [
            ['id' => 50, 'user_id' => 1, 'product_id' => 10, 'quantity' => 3],
        ];

        $this->cartDaoMock
            ->method('getUserCart')
            ->with(1)
            ->willReturn($existingCartItems);

        // Should call update with id=50 and new quantity = 3 + 2 = 5
        $this->cartDaoMock
            ->expects($this->once())
            ->method('update')
            ->with(50, ['quantity' => 5])
            ->willReturn(['id' => 50, 'quantity' => 5]);

        // insert should NOT be called
        $this->cartDaoMock
            ->expects($this->never())
            ->method('insert');

        $result = $this->cartService->addToCart(1, 10, 2);

        $this->assertEquals(5, $result['quantity']);
    }

    // -----------------------------------------------------------------------
    // getCartByUser tests
    // -----------------------------------------------------------------------

    public function testGetCartByUserReturnsAllItemsForUser(): void
    {
        $cartItems = [
            ['id' => 1, 'user_id' => 3, 'product_id' => 5, 'quantity' => 1],
            ['id' => 2, 'user_id' => 3, 'product_id' => 7, 'quantity' => 2],
        ];

        $this->cartDaoMock
            ->method('getUserCart')
            ->with(3)
            ->willReturn($cartItems);

        $result = $this->cartService->getCartByUser(3);

        $this->assertCount(2, $result);
        $this->assertEquals(3, $result[0]['user_id']);
    }

    public function testGetCartByUserReturnsEmptyArrayForEmptyCart(): void
    {
        $this->cartDaoMock
            ->method('getUserCart')
            ->willReturn([]);

        $result = $this->cartService->getCartByUser(99);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    // -----------------------------------------------------------------------
    // updateCartItemQuantity tests
    // -----------------------------------------------------------------------

    public function testUpdateCartItemQuantityCallsDaoUpdate(): void
    {
        $this->cartDaoMock
            ->expects($this->once())
            ->method('update')
            ->with(10, ['quantity' => 4])
            ->willReturn(['id' => 10, 'quantity' => 4]);

        $result = $this->cartService->updateCartItemQuantity(10, 4);

        $this->assertEquals(4, $result['quantity']);
    }

    // -----------------------------------------------------------------------
    // removeItem tests
    // -----------------------------------------------------------------------

    public function testRemoveItemCallsDaoDelete(): void
    {
        $this->cartDaoMock
            ->expects($this->once())
            ->method('delete')
            ->with(7)
            ->willReturn(true);

        $result = $this->cartService->removeItem(7);

        $this->assertTrue($result);
    }
}

<?php

use PHPUnit\Framework\TestCase;

/**
 * Unit tests for FavouriteService
 *
 * Tests cover:
 *   - addToFavourites successfully inserts a new favourite
 *   - addToFavourites throws exception for duplicate favourite
 *   - getFavourites returns user's favourites
 *   - getFavourites returns empty array when none saved
 *   - removeFromFavourites delegates to dao delete
 */
class FavouriteServiceTest extends TestCase
{
    private $favouriteDaoMock;
    private $favouriteService;

    protected function setUp(): void
    {
        require_once __DIR__ . '/../service/FavoritesService.php';

        $this->favouriteDaoMock = $this->createMock(FavouriteDao::class);

        $this->favouriteService = $this->getMockBuilder(FavouriteService::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock();

        $reflection = new ReflectionClass($this->favouriteService);

        $favDaoProp = $reflection->getProperty('favouriteDao');
        $favDaoProp->setAccessible(true);
        $favDaoProp->setValue($this->favouriteService, $this->favouriteDaoMock);

        $daoProp = $reflection->getProperty('dao');
        $daoProp->setAccessible(true);
        $daoProp->setValue($this->favouriteService, $this->favouriteDaoMock);
    }

    // -----------------------------------------------------------------------
    // addToFavourites tests
    // -----------------------------------------------------------------------

    public function testAddToFavouritesInsertsSuccessfully(): void
    {
        // No existing favourites for user 1
        $this->favouriteDaoMock
            ->method('getUserFavourites')
            ->with(1)
            ->willReturn([]);

        $this->favouriteDaoMock
            ->expects($this->once())
            ->method('insert')
            ->with(['user_id' => 1, 'product_id' => 5])
            ->willReturn(['id' => 99]);

        $result = $this->favouriteService->addToFavourites(1, 5);

        $this->assertNotNull($result);
    }

    public function testAddToFavouritesThrowsExceptionForDuplicate(): void
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessageMatches('/already in favourites/i');

        // Product 5 is already in favourites for user 1
        $this->favouriteDaoMock
            ->method('getUserFavourites')
            ->with(1)
            ->willReturn([
                ['id' => 20, 'user_id' => 1, 'product_id' => 5],
            ]);

        $this->favouriteService->addToFavourites(1, 5);
    }

    // -----------------------------------------------------------------------
    // getFavourites tests
    // -----------------------------------------------------------------------

    public function testGetFavouritesReturnsUserFavourites(): void
    {
        $favourites = [
            ['id' => 1, 'user_id' => 2, 'product_id' => 10],
            ['id' => 2, 'user_id' => 2, 'product_id' => 15],
        ];

        $this->favouriteDaoMock
            ->method('getUserFavourites')
            ->with(2)
            ->willReturn($favourites);

        $result = $this->favouriteService->getFavourites(2);

        $this->assertCount(2, $result);
        $this->assertEquals(10, $result[0]['product_id']);
    }

    public function testGetFavouritesReturnsEmptyArrayWhenNoneSaved(): void
    {
        $this->favouriteDaoMock
            ->method('getUserFavourites')
            ->willReturn([]);

        $result = $this->favouriteService->getFavourites(99);

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    // -----------------------------------------------------------------------
    // removeFromFavourites tests
    // -----------------------------------------------------------------------

    public function testRemoveFromFavouritesCallsDaoDelete(): void
    {
        $this->favouriteDaoMock
            ->expects($this->once())
            ->method('delete')
            ->with(20)
            ->willReturn(true);

        $result = $this->favouriteService->removeFromFavourites(20);

        $this->assertTrue($result);
    }
}

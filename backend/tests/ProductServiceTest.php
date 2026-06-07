<?php

use PHPUnit\Framework\TestCase;

/**
 * Unit tests for ProductService
 *
 * Tests cover:
 *   - getAll returns all products
 *   - getById returns correct product
 *   - searchProducts returns matching results
 *   - searchProducts returns empty array when no match
 *   - getProductsByBrand filters correctly
 *   - getProductsUnderPrice filters correctly
 */
class ProductServiceTest extends TestCase
{
    private $productDaoMock;
    private $productService;

    protected function setUp(): void
    {
        require_once __DIR__ . '/../service/ProductService.php';

        $this->productDaoMock = $this->createMock(ProductDao::class);

        $this->productService = $this->getMockBuilder(ProductService::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock();

        $reflection = new ReflectionClass($this->productService);

        $productDaoProp = $reflection->getProperty('productDao');
        $productDaoProp->setAccessible(true);
        $productDaoProp->setValue($this->productService, $this->productDaoMock);

        $daoProp = $reflection->getProperty('dao');
        $daoProp->setAccessible(true);
        $daoProp->setValue($this->productService, $this->productDaoMock);
    }

    // -----------------------------------------------------------------------
    // getAll tests
    // -----------------------------------------------------------------------

    public function testGetAllReturnsAllProducts(): void
    {
        $products = [
            ['id' => 1, 'name' => 'Air Max', 'price' => 120.00],
            ['id' => 2, 'name' => 'Ultra Boost', 'price' => 150.00],
        ];

        $this->productDaoMock
            ->method('getAll')
            ->willReturn($products);

        $result = $this->productService->getAll();

        $this->assertCount(2, $result);
        $this->assertEquals('Air Max', $result[0]['name']);
    }

    // -----------------------------------------------------------------------
    // getById tests
    // -----------------------------------------------------------------------

    public function testGetByIdReturnsCorrectProduct(): void
    {
        $product = ['id' => 3, 'name' => 'Jordan 1', 'price' => 180.00];

        $this->productDaoMock
            ->method('getById')
            ->with(3)
            ->willReturn($product);

        $result = $this->productService->getById(3);

        $this->assertEquals('Jordan 1', $result['name']);
        $this->assertEquals(180.00, $result['price']);
    }

    public function testGetByIdReturnsNullForNonExistentProduct(): void
    {
        $this->productDaoMock
            ->method('getById')
            ->willReturn(null);

        $result = $this->productService->getById(9999);

        $this->assertNull($result);
    }

    // -----------------------------------------------------------------------
    // searchProducts tests
    // -----------------------------------------------------------------------

    public function testSearchProductsReturnsMatchingResults(): void
    {
        $searchResults = [
            ['id' => 1, 'name' => 'Nike Air Max 90', 'price' => 130.00],
        ];

        $this->productDaoMock
            ->method('search')
            ->with('Air Max')
            ->willReturn($searchResults);

        $result = $this->productService->searchProducts('Air Max');

        $this->assertCount(1, $result);
        $this->assertStringContainsString('Air Max', $result[0]['name']);
    }

    public function testSearchProductsReturnsEmptyArrayWhenNoMatch(): void
    {
        $this->productDaoMock
            ->method('search')
            ->with('xyz_nonexistent')
            ->willReturn([]);

        $result = $this->productService->searchProducts('xyz_nonexistent');

        $this->assertIsArray($result);
        $this->assertEmpty($result);
    }

    // -----------------------------------------------------------------------
    // getProductsByBrand tests
    // -----------------------------------------------------------------------

    public function testGetProductsByBrandReturnsFilteredProducts(): void
    {
        $nikeProducts = [
            ['id' => 1, 'name' => 'Air Max', 'brand' => 'Nike'],
            ['id' => 2, 'name' => 'Air Force 1', 'brand' => 'Nike'],
        ];

        $this->productDaoMock
            ->method('getByBrand')
            ->with('Nike')
            ->willReturn($nikeProducts);

        $result = $this->productService->getProductsByBrand('Nike');

        $this->assertCount(2, $result);
        foreach ($result as $product) {
            $this->assertEquals('Nike', $product['brand']);
        }
    }

    // -----------------------------------------------------------------------
    // getProductsUnderPrice tests
    // -----------------------------------------------------------------------

    public function testGetProductsUnderPriceReturnsFilteredProducts(): void
    {
        $affordable = [
            ['id' => 5, 'name' => 'Budget Runner', 'price' => 59.99],
            ['id' => 6, 'name' => 'Classic Low', 'price' => 79.99],
        ];

        $this->productDaoMock
            ->method('getUnderPrice')
            ->with(100)
            ->willReturn($affordable);

        $result = $this->productService->getProductsUnderPrice(100);

        $this->assertCount(2, $result);
        foreach ($result as $product) {
            $this->assertLessThan(100, $product['price']);
        }
    }
}

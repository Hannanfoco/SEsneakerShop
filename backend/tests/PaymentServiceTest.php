<?php

use PHPUnit\Framework\TestCase;

/**
 * Unit tests for PaymentService
 *
 * Tests cover:
 *   - create() stores a payment record correctly
 *   - getById() returns the correct payment record
 *   - getAll() returns all payment records
 *   - delete() removes a payment record
 */
class PaymentServiceTest extends TestCase
{
    private $paymentDaoMock;
    private $paymentService;

    protected function setUp(): void
    {
        require_once __DIR__ . '/../service/PaymentService.php';

        $this->paymentDaoMock = $this->createMock(PaymentDao::class);

        $this->paymentService = $this->getMockBuilder(PaymentService::class)
            ->disableOriginalConstructor()
            ->onlyMethods([])
            ->getMock();

        $reflection = new ReflectionClass($this->paymentService);

        // PaymentService extends BaseService – inject via the 'dao' property
        $daoProp = $reflection->getProperty('dao');
        $daoProp->setAccessible(true);
        $daoProp->setValue($this->paymentService, $this->paymentDaoMock);

        // Also set paymentDao if present in the class
        if ($reflection->hasProperty('paymentDao')) {
            $paymentDaoProp = $reflection->getProperty('paymentDao');
            $paymentDaoProp->setAccessible(true);
            $paymentDaoProp->setValue($this->paymentService, $this->paymentDaoMock);
        }
    }

    // -----------------------------------------------------------------------
    // create tests
    // -----------------------------------------------------------------------

    public function testCreatePaymentStoresRecord(): void
    {
        $paymentData = [
            'user_id'        => 1,
            'amount'         => 249.99,
            'payment_status' => 'successful',
        ];

        $this->paymentDaoMock
            ->expects($this->once())
            ->method('insert')
            ->with($paymentData)
            ->willReturn(['id' => 1, ...$paymentData]);

        $result = $this->paymentService->create($paymentData);

        $this->assertEquals(1, $result['user_id']);
        $this->assertEquals('successful', $result['payment_status']);
    }

    public function testCreatePaymentWithPendingStatus(): void
    {
        $paymentData = [
            'user_id'        => 3,
            'amount'         => 89.99,
            'payment_status' => 'pending',
        ];

        $this->paymentDaoMock
            ->method('insert')
            ->willReturn(['id' => 2, ...$paymentData]);

        $result = $this->paymentService->create($paymentData);

        $this->assertEquals('pending', $result['payment_status']);
    }

    // -----------------------------------------------------------------------
    // getById tests
    // -----------------------------------------------------------------------

    public function testGetByIdReturnsCorrectPayment(): void
    {
        $payment = [
            'id'             => 5,
            'user_id'        => 2,
            'amount'         => 199.00,
            'payment_status' => 'successful',
        ];

        $this->paymentDaoMock
            ->method('getById')
            ->with(5)
            ->willReturn($payment);

        $result = $this->paymentService->getById(5);

        $this->assertEquals(5, $result['id']);
        $this->assertEquals(199.00, $result['amount']);
    }

    public function testGetByIdReturnsNullForNonExistentPayment(): void
    {
        $this->paymentDaoMock
            ->method('getById')
            ->willReturn(null);

        $result = $this->paymentService->getById(9999);

        $this->assertNull($result);
    }

    // -----------------------------------------------------------------------
    // getAll tests
    // -----------------------------------------------------------------------

    public function testGetAllReturnsAllPayments(): void
    {
        $payments = [
            ['id' => 1, 'user_id' => 1, 'amount' => 100.00, 'payment_status' => 'successful'],
            ['id' => 2, 'user_id' => 2, 'amount' => 200.00, 'payment_status' => 'failed'],
        ];

        $this->paymentDaoMock
            ->method('getAll')
            ->willReturn($payments);

        $result = $this->paymentService->getAll();

        $this->assertCount(2, $result);
    }

    // -----------------------------------------------------------------------
    // delete tests
    // -----------------------------------------------------------------------

    public function testDeletePaymentCallsDaoDelete(): void
    {
        $this->paymentDaoMock
            ->expects($this->once())
            ->method('delete')
            ->with(3)
            ->willReturn(true);

        $result = $this->paymentService->delete(3);

        $this->assertTrue($result);
    }
}

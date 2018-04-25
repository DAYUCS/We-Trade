# We.Trade Network

> Demo steps:

0. Run SetupDemo to create necessary participants and asserts

1. Run InitPurchaseOrder for a buyer to initiate PO and request its bank to provide Bank Payment Undertaking (BPU)
   Input Data:
   {
  "$class": "com.eximbills.tf.bpu.InitPurchaseOrder",
  "purchaseOrderId": "PO_002",
  "buyerId": "buyer@email.com",
  "buyerBankId": "buyerBank@email.com",
  "supplierId": "supplier@email.com",
  "supplierBankId": "supplierBank@email.com",
  "orderDateTime": "2018-04-23T01:57:11.150Z",
  "paymentDays": 60,
  "purchaseOrderAmount": {
    "$class": "com.eximbills.tf.bpu.TransactionAmount",
    "currency": "USD",
    "amount": 10000
  },
  "minInvoiceAmountAdjust": 0.05,
  "maxInvoiceAmountAdjust": 0.05,
  "goodsDescription": "iPhone 8 Pluse 1000 pcs"
}

2. Run ConfirmBpu for the buyer's bank to confirm providing of BPU
   Input Data:
   {
  "$class": "com.eximbills.tf.bpu.ConfirmBpu",
  "purchaseOrder": "resource:com.eximbills.tf.bpu.PurchaseOrder#PO_002"
  }

3. Run ShipOrder for the supplier to ship order and send invoice through the platform
   Input Data:
   {
  "$class": "com.eximbills.tf.bpu.ShipOrder",
  "invoiceId": "INV_002",
  "shipmentInformation": "iPhone 8 plus 980 pcs",
  "shipmentDateTime": "2018-04-23T06:17:47.996Z",
  "invoiceAmount": 9800,
  "purchaseOrder": "resource:com.eximbills.tf.bpu.PurchaseOrder#PO_002"
}

4. Run ConfirmReciptOfGoods for the buyer to confirm the receipt of goods
   Input Data:
   {
  "$class": "com.eximbills.tf.bpu.ConfirmReciptOfGoods",
  "invoice": "resource:com.eximbills.tf.bpu.Invoice#INV_002"
}

5. Run RequestInvoiceFinancing for the supplier to request invoice financing
   Input Data:
   {
  "$class": "com.eximbills.tf.bpu.RequestInvoiceFinancing",
  "invoice": "resource:com.eximbills.tf.bpu.Invoice#INV_002"
}

6. Run ProvideInvoiceFinancing for the supplier's bank to provide invoice financing
   Input Data:
   {
  "$class": "com.eximbills.tf.bpu.ProvideInvoiceFinancing",
  "invoice": "resource:com.eximbills.tf.bpu.Invoice#INV_002"
}

7. Run Payment for the buyer's bank to debit buyer accout and initiate payment of invoice on due date, either...
   - to supplier's bank, if invoice has been financed or
   - to supplier's account
   Input Data:
   {
  "$class": "com.eximbills.tf.bpu.Payment",
  "invoice": "resource:com.eximbills.tf.bpu.Invoice#INV_002"
}
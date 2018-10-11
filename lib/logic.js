/**
 * Initialize some test assets and participants useful for running a demo.
 * @param {com.eximbills.tf.bpu.SetupDemo} setupDemo - the SetupDemo transaction
 * @transaction
 */
async function setupDemo(setupDemo) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const NS = 'com.eximbills.tf.bpu';

    // create the buyer
    const buyer = factory.newResource(NS, 'Buyer', 'buyer@email.com');
    const buyerAddress = factory.newConcept(NS, 'Address');
    const buyerAccountBalance = factory.newConcept(NS, 'TransactionAmount');
    buyerAddress.country = 'USA';
    buyer.address = buyerAddress;
    buyerAccountBalance.currency = 'USD';
    buyerAccountBalance.amount = 10000.0;
    buyer.accountBalance = buyerAccountBalance;

    // create the supplier
    const supplier = factory.newResource(NS, 'Supplier', 'supplier@email.com');
    const supplierAddress = factory.newConcept(NS, 'Address');
    const supplierAccountBalance = factory.newConcept(NS, 'TransactionAmount');
    supplierAddress.country = 'HK';
    supplier.address = supplierAddress;
    supplierAccountBalance.currency = 'USD'
    supplierAccountBalance.amount = 0.0;
    supplier.accountBalance = supplierAccountBalance;

    // create the buyer's bank
    const buyerBank = factory.newResource(NS, 'BuyerBank', 'buyerBank@email.com');
    const buyerBankAddress = factory.newConcept(NS, 'Address');
    const buyerBankAccountBalance = factory.newConcept(NS, 'TransactionAmount');
    buyerBankAddress.country = 'USA';
    buyerBank.address = buyerBankAddress;
    buyerBankAccountBalance.currency = 'USD';
    buyerBankAccountBalance.amount = 1000000.0;
    buyerBank.accountBalance = buyerBankAccountBalance;

    // create the supplier's bank
    const supplierBank = factory.newResource(NS, 'SupplierBank', 'supplierBank@email.com');
    const supplierBankAddress = factory.newConcept(NS, 'Address');
    const supplierBankAccountBalance = factory.newConcept(NS, 'TransactionAmount');
    supplierBankAddress.country = 'HK';
    supplierBank.address = supplierBankAddress;
    supplierBankAccountBalance.currency = 'USD';
    supplierBankAccountBalance.amount = 1500000.0;
    supplierBank.accountBalance = supplierBankAccountBalance;

    // create the purchase order
    const purchaseOrder = factory.newResource(NS, 'PurchaseOrder', 'PO_001');
    purchaseOrder.buyer = factory.newRelationship(NS, 'Buyer', 'buyer@email.com');
    purchaseOrder.supplier = factory.newRelationship(NS, 'Supplier', 'supplier@email.com');
    purchaseOrder.buyerBank = factory.newRelationship(NS, 'BuyerBank', 'buyerBank@email.com');
    purchaseOrder.supplierBank = factory.newRelationship(NS, 'SupplierBank', 'supplierBank@email.com');
    purchaseOrder.status = 'SHIPMENT';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    purchaseOrder.orderDateTime = tomorrow;
    purchaseOrder.paymentDays = 60;
    const purchaseOrderAmount = factory.newConcept(NS, 'TransactionAmount');
    purchaseOrderAmount.currency = 'USD';
    purchaseOrderAmount.amount = 1000.0;
    purchaseOrder.purchaseOrderAmount = purchaseOrderAmount;
    purchaseOrder.minInvoiceAmountAdjust = 0.05; // 5 percent
    purchaseOrder.maxInvoiceAmountAdjust = 0.05; // 5 percent
    const purchaseOrderBalance = factory.newConcept(NS, 'TransactionAmount');
    purchaseOrderBalance.currency = 'USD';
    purchaseOrderBalance.amount = 20.0;
    purchaseOrder.purchaseOrderBalance = purchaseOrderBalance;
    purchaseOrder.goodsDescription = 'iPhone X 10 pcs';

    // create the shipment & invoice
    const invoice = factory.newResource(NS, 'Invoice', 'INV_001');
    invoice.shipmentInformation = 'DHL-0000230012';
    invoice.shipmentStatus = 'CREATED';
    const week = new Date();
    week.setDate(week.getDate() + 7);
    invoice.shipmentDateTime = week;
    const invoiceAmount = factory.newConcept(NS, 'TransactionAmount');
    invoiceAmount.currency = 'USD';
    invoiceAmount.amount = 980.0;
    invoice.invoiceAmount = invoiceAmount;
    invoice.purchaseOrder = factory.newRelationship(NS, 'PurchaseOrder', 'PO_001');

    // add the buyer
    const buyerRegistry = await getParticipantRegistry(NS + '.Buyer');
    await buyerRegistry.addAll([buyer]);

    // add the supplier
    const supplierRegistry = await getParticipantRegistry(NS + '.Supplier');
    await supplierRegistry.addAll([supplier]);

    // add the buyer's bank
    const buyerBankRegistry = await getParticipantRegistry(NS + '.BuyerBank');
    await buyerBankRegistry.addAll([buyerBank]);

    // add the supplier's bank
    const supplierBankRegistry = await getParticipantRegistry(NS + '.SupplierBank');
    await supplierBankRegistry.addAll([supplierBank]);

    // add the PO
    const purchaseOrderRegistry = await getAssetRegistry(NS + '.PurchaseOrder');
    await purchaseOrderRegistry.addAll([purchaseOrder]);

    // add the shipments & invoice
    const invoiceRegistry = await getAssetRegistry(NS + '.Invoice');
    await invoiceRegistry.addAll([invoice]);
}

/**
 * A Buyer initiates a PO and request bank to provide BPU
 * @param {com.eximbills.tf.bpu.InitPurchaseOrder} initPurchaseOrder - the initPurchaseOrder transaction
 * @transaction
 */
async function initPurchaseOrder(initPurchaseOrder) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const NS = 'com.eximbills.tf.bpu';

    const purchaseOrderId = initPurchaseOrder.purchaseOrderId;
    const buyerId = initPurchaseOrder.buyerId;
    const buyerBankId = initPurchaseOrder.buyerBankId;
    const supplierId = initPurchaseOrder.supplierId;
    const supplierBankId = initPurchaseOrder.supplierBankId;
    const orderDateTime = initPurchaseOrder.orderDateTime;
    const paymentDays = initPurchaseOrder.paymentDays;
    const purchaseOrderAmount = initPurchaseOrder.purchaseOrderAmount;
    const minInvoiceAmountAdjust = initPurchaseOrder.minInvoiceAmountAdjust;
    const maxInvoiceAmountAdjust = initPurchaseOrder.maxInvoiceAmountAdjust;
    const goodsDescription = initPurchaseOrder.goodsDescription;
    
    const purchaseOrder = factory.newResource(NS, 'PurchaseOrder', purchaseOrderId);
    purchaseOrder.buyer = factory.newRelationship(NS, 'Buyer', buyerId);
    purchaseOrder.supplier = factory.newRelationship(NS, 'Supplier', supplierId);
    purchaseOrder.buyerBank = factory.newRelationship(NS, 'BuyerBank', buyerBankId);
    purchaseOrder.supplierBank = factory.newRelationship(NS, 'SupplierBank', supplierBankId);
    purchaseOrder.status = 'CREATED';
    purchaseOrder.orderDateTime = orderDateTime;
    purchaseOrder.paymentDays = paymentDays;
    purchaseOrder.purchaseOrderAmount = purchaseOrderAmount;
    purchaseOrder.minInvoiceAmountAdjust = minInvoiceAmountAdjust;
    purchaseOrder.maxInvoiceAmountAdjust = maxInvoiceAmountAdjust;
    purchaseOrder.purchaseOrderBalance = purchaseOrderAmount;
    purchaseOrder.goodsDescription = goodsDescription;

    // add the PO
    const purchaseOrderRegistry = await getAssetRegistry(NS + '.PurchaseOrder');
    await purchaseOrderRegistry.addAll([purchaseOrder]);
}

/**
 * A buyer's bank confirms the BPU for the PO
 * @param {com.eximbills.tf.bpu.ConfirmBpu} confirmBpu - the ConfirmBpu transaction
 * @transaction
 */
async function confirmBpu(confirmBpu) {  // eslint-disable-line no-unused-vars
    
    const NS = 'com.eximbills.tf.bpu';

    const purchaseOrder = confirmBpu.purchaseOrder;

    console.log('The Purchase order is: ' + purchaseOrder.purchaseOrderId);
    console.log('This status of this PO is: ' + purchaseOrder.status);

    if (purchaseOrder.status != 'CREATED') {
        throw new Error('Current status of PO has already been ' + purchaseOrder.status + '.');
    }

    // set the status of the purchase order
    purchaseOrder.status = 'BPU_CONFIRMED';

    // update the state of the shipment
    const purchaseOrderRegistry = await getAssetRegistry(NS + '.PurchaseOrder');
    await purchaseOrderRegistry.update(purchaseOrder);
}

/**
 * A supplier ships order and sends invoice through the platform
 * @param {com.eximbills.tf.bpu.ShipOrder} shipOrder - the ShipOrder transaction
 * @transaction
 */
async function shipOrder(shipOrder) {  // eslint-disable-line no-unused-vars

    const factory = getFactory();
    const NS = 'com.eximbills.tf.bpu';

    const purchaseOrder = shipOrder.purchaseOrder;
    const invoiceId = shipOrder.invoiceId;
    const shipmentInformation = shipOrder.shipmentInformation;
    const shipmentDateTime = shipOrder.shipmentDateTime;
    const invoiceAmount = shipOrder.invoiceAmount;
    console.log('The Purchase order is: ' + purchaseOrder.purchaseOrderId);
    console.log('This status of this PO is: ' + purchaseOrder.status);

    // check purchase order status
    if (purchaseOrder.status == 'CREATED' || purchaseOrder.status == 'END') {
        throw new Error('Current status of PO is ' + purchaseOrder.status + '.');
    }

    // check invoice amount
    if (invoiceAmount < (purchaseOrder.purchaseOrderAmount.amount * purchaseOrder.minInvoiceAmountAdjust)) {
        throw new Error('Invoice amount underflow.');
    }

    // check invoice amount with purchase order balance
    purchaseOrder.purchaseOrderBalance.amount = purchaseOrder.purchaseOrderBalance.amount - invoiceAmount;
    if ( purchaseOrder.purchaseOrderBalance.amount <  (- purchaseOrder.purchaseOrderAmount.amount * purchaseOrder.maxInvoiceAmountAdjust)) {
        throw new Error('Invoice amount overflow.');
    }

    // create the shipment & invoice
    const invoice = factory.newResource(NS, 'Invoice', invoiceId);
    invoice.purchaseOrder = factory.newRelationship(NS, 'PurchaseOrder', purchaseOrder.purchaseOrderId);
    invoice.invoiceId = invoiceId;
    invoice.shipmentInformation = shipmentInformation;
    invoice.shipmentDateTime = shipmentDateTime;
    invoice.shipmentStatus = 'CREATED';
    invoice.invoiceAmount = factory.newConcept(NS, 'TransactionAmount');
    invoice.invoiceAmount.amount = invoiceAmount;
    invoice.invoiceAmount.currency = purchaseOrder.purchaseOrderAmount.currency;
    invoice.invoiceFinancingAmount = factory.newConcept(NS, 'TransactionAmount');
    invoice.invoiceFinancingAmount.amount = 0.0;
    invoice.invoiceFinancingAmount.currency = purchaseOrder.purchaseOrderAmount.currency;
    
    // set the status of the purchase order
    purchaseOrder.status = 'SHIPMENT';

    // update the state of the purchase order
    const purchaseOrderRegistry = await getAssetRegistry(NS + '.PurchaseOrder');
    await purchaseOrderRegistry.update(purchaseOrder);

    // add the shipments & invoice
    const invoiceRegistry = await getAssetRegistry(NS + '.Invoice');
    await invoiceRegistry.addAll([invoice]);
}

/**
 * A buyer confirms recipt of goods
 * @param {com.eximbills.tf.bpu.ConfirmReciptOfGoods} confirmReciptOfGoods - the ShipOrder transaction
 * @transaction
 */
async function confirmReciptOfGoods(confirmReciptOfGoods) {  // eslint-disable-line no-unused-vars

    //const factory = getFactory();
    const NS = 'com.eximbills.tf.bpu';

    const invoice = confirmReciptOfGoods.invoice;
    const purchaseOrder = invoice.purchaseOrder;

    // check shipment status of invoice
    if (invoice.shipmentStatus != 'CREATED') {
        throw new Error('Current status of shipment is ' + invoice.shipmentStatus);
    }

    // set status of invoice
    invoice.shipmentStatus = 'ARRIVED';
    invoice.invoiceFinancingStatus = 'NONE';

    // update status of invoice
    const invoiceRegistry = await getAssetRegistry(NS + '.Invoice');
    await invoiceRegistry.update(invoice); 

    // set status of PO 
    purchaseOrder.status = 'CONFIRM_RECEIPT_OF_GOODS';

    // update status of PO
    const purchaseOrderRegistry = await getAssetRegistry(NS + '.PurchaseOrder');
    await purchaseOrderRegistry.update(purchaseOrder);
}

/**
 * A supplier requests invoice financing
 * @param {com.eximbills.tf.bpu.RequestInvoiceFinancing} requestInvoiceFinancing - the ShipOrder transaction
 * @transaction
 */
async function requestInvoiceFinancing(requestInvoiceFinancing) {  // eslint-disable-line no-unused-vars

    //const factory = getFactory();
    const NS = 'com.eximbills.tf.bpu';

    const invoice = requestInvoiceFinancing.invoice;

    // check shipment status of invoice
    if (invoice.shipmentStatus != 'ARRIVED') {
        throw new Error('Current status of shipment is ' + invoice.shipmentStatus);
    }

    // check financing status of invoice
    if (invoice.invoiceFinancingStatus != 'NONE') {
        throw new Error('Current status of financing is ' + invoice.invoiceFinancingStatus);
    }

    // set status of invoice
    invoice.invoiceFinancingStatus = 'FINANCING_REQUESTED';

    // update status of invoice
    const invoiceRegistry = await getAssetRegistry(NS + '.Invoice');
    await invoiceRegistry.update(invoice); 
}

/**
 * A supplier's bank provides invoice financing
 * @param {com.eximbills.tf.bpu.ProvideInvoiceFinancing} provideInvoiceFinancing - the ShipOrder transaction
 * @transaction
 */
async function provideInvoiceFinancing(provideInvoiceFinancing) {  // eslint-disable-line no-unused-vars

    //const factory = getFactory();
    const NS = 'com.eximbills.tf.bpu';

    const financingAmt = provideInvoiceFinancing.financingAmount;
    const invoice = provideInvoiceFinancing.invoice;
    //const purchaseOrder = invoice.purchaseOrder;
    //const supplier = purchaseOrder.supplier;
    //const supplierBank = purchaseOrder.supplierBank;

    // (mark this for SIBOS Demo) check financing status of invoice
    //if (invoice.invoiceFinancingStatus != 'FINANCING_REQUESTED') {
    //    throw new Error('Current status of financing is ' + invoice.invoiceFinancingStatus);
    //}

    console.log("Financing Amount: " + financingAmt.amount);
    console.log("Invoice ID: " + invoice.invoiceId);
    console.log("Original Financing Amount: " + invoice.invoiceFinancingAmount.amount);

    // set status of invoice
    invoice.invoiceFinancingStatus = 'FINANCED';

    // set financing amount of invoice
    invoice.invoiceFinancingAmount = financingAmt;

    // set account balance of supplier
    //supplier.accountBalance.amount = supplier.accountBalance.amount + financingAmt.amount;

    // set account balance of suplier's bank
    //supplierBank.accountBalance.amount = supplierBank.accountBalance.amount - financingAmt.amount;

    // update status of invoice
    const invoiceRegistry = await getAssetRegistry(NS + '.Invoice');
    await invoiceRegistry.update(invoice); 

    // (mark this for SIBOS Demo) update account balance of supplier
    //const supplierRegistry = await getParticipantRegistry(NS + '.Supplier');
    //await supplierRegistry.update(supplier);

    // (mark this for SIBOS Demo) update account balance of supplier's bank
    //const supplierBankRegistry = await getParticipantRegistry(NS + '.SupplierBank');
    //await supplierBankRegistry.update(supplierBank);
}

/**
 * A buyer's bank debits buyer account and initiates payment of invoice on due date.
 * @param {com.eximbills.tf.bpu.Payment} payment - the ShipOrder transaction
 * @transaction
 */
async function payment(payment) {  // eslint-disable-line no-unused-vars

    //const factory = getFactory();
    const NS = 'com.eximbills.tf.bpu';

    const invoice = payment.invoice;
    const purchaseOrder = invoice.purchaseOrder;
    const buyer = purchaseOrder.buyer;
    const supplier = purchaseOrder.supplier;
    const supplierBank = purchaseOrder.supplierBank;

    // check shipment status of invoice
    if (invoice.shipmentStatus != 'ARRIVED') {
        throw new Error('Current status of shipment is ' + invoice.shipmentStatus);
    }

    // set PO status
    purchaseOrder.status = 'PAYMENT';

    // debit buyer account
    buyer.accountBalance.amount = buyer.accountBalance.amount - invoice.invoiceAmount.amount;

    // credit supplier's bank account or supplier account
    if (invoice.invoiceFinancingStatus = 'FINANCED') {
        supplierBank.accountBalance.amount = supplierBank.accountBalance.amount + invoice.invoiceAmount.amount;
    } else {
        supplier.accountBalance.amount = supplier.accountBalance.amount + invoice.invoiceAmount.amount;
    }

    // update PO
    const purchaseOrderRegistry = await getAssetRegistry(NS + '.PurchaseOrder');
    await purchaseOrderRegistry.update(purchaseOrder);

    // update buyer
    const buyerRegistry = await getParticipantRegistry(NS + '.Buyer');
    await buyerRegistry.update(buyer);

    // update supplier's bank or supplier
    if (invoice.invoiceFinancingStatus = 'FINANCED') {
        const supplierBankRegistry = await getParticipantRegistry(NS + '.SupplierBank');
        await supplierBankRegistry.update(supplierBank);
    } else {
        const supplierRegistry = getParticipantRegistry(NS + '.Supplier');
        await supplierRegistry.update(supplier);
    }

    // update invoice
    invoice.invoiceFinancingStatus = 'PAYMENT';
    const invoiceRegistry = await getAssetRegistry(NS + '.Invoice');
    await invoiceRegistry.update(invoice);
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Expense model
const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});
const Expense = mongoose.model('Expense', expenseSchema);

// Monthly Statement model (estado de resultado mensual)
const monthlyStatementSchema = new mongoose.Schema({
    month: { type: String, required: true }, // e.g., "2024-06"
    income: { type: Number, required: true },
    debt: { type: Number, required: true },
    notes: { type: String }
});
const MonthlyStatement = mongoose.model('MonthlyStatement', monthlyStatementSchema);

// Payment model (calendar/agenda)
const paymentSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
});
const Payment = mongoose.model('Payment', paymentSchema);

// Expenses routes
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/expenses', async (req, res) => {
    try {
        const expense = new Expense(req.body);
        const savedExpense = await expense.save();
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/expenses/:id', async (req, res) => {
    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedExpense) return res.status(404).json({ message: 'Expense not found' });
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
        if (!deletedExpense) return res.status(404).json({ message: 'Expense not found' });
        res.json(deletedExpense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Monthly Statement routes
app.get('/api/monthly-statements', async (req, res) => {
    try {
        const statements = await MonthlyStatement.find();
        res.json(statements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/monthly-statements', async (req, res) => {
    try {
        const statement = new MonthlyStatement(req.body);
        const savedStatement = await statement.save();
        res.status(201).json(savedStatement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/monthly-statements/:id', async (req, res) => {
    try {
        const updatedStatement = await MonthlyStatement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedStatement) return res.status(404).json({ message: 'Monthly statement not found' });
        res.json(updatedStatement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/monthly-statements/:id', async (req, res) => {
    try {
        const deletedStatement = await MonthlyStatement.findByIdAndDelete(req.params.id);
        if (!deletedStatement) return res.status(404).json({ message: 'Monthly statement not found' });
        res.json(deletedStatement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Payment routes (calendar/agenda)
app.get('/api/payments', async (req, res) => {
    try {
        const payments = await Payment.find();
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const payment = new Payment(req.body);
        const savedPayment = await payment.save();
        res.status(201).json(savedPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/payments/:id', async (req, res) => {
    try {
        const updatedPayment = await Payment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedPayment) return res.status(404).json({ message: 'Payment not found' });
        res.json(updatedPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/payments/:id', async (req, res) => {
    try {
        const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
        if (!deletedPayment) return res.status(404).json({ message: 'Payment not found' });
        res.json(deletedPayment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ... Aquí se agregarán las rutas ...

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.log(err));
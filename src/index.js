const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User model
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Auth middleware
function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

// Expense model
const expenseSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Expense = mongoose.model('Expense', expenseSchema);

// Monthly Statement model (estado de resultado mensual)
const monthlyStatementSchema = new mongoose.Schema({
    month: { type: String, required: true }, // e.g., "2024-06"
    income: { type: Number, required: true },
    debt: { type: Number, required: true },
    notes: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const MonthlyStatement = mongoose.model('MonthlyStatement', monthlyStatementSchema);

// Payment model (calendar/agenda)
const paymentSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Payment = mongoose.model('Payment', paymentSchema);

// Expense routes
app.get('/api/expenses', auth, async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.userId });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/expenses', auth, async (req, res) => {
    try {
        const expense = new Expense({ ...req.body, userId: req.userId });
        const savedExpense = await expense.save();
        res.status(201).json(savedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/expenses/:id', auth, async (req, res) => {
    try {
        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedExpense) return res.status(404).json({ message: 'Expense not found' });
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/expenses/:id', auth, async (req, res) => {
    try {
        const deletedExpense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedExpense) return res.status(404).json({ message: 'Expense not found' });
        res.json(deletedExpense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Monthly Statement routes
app.get('/api/monthly-statements', auth, async (req, res) => {
    try {
        const statements = await MonthlyStatement.find({ userId: req.userId });
        res.json(statements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/monthly-statements', auth, async (req, res) => {
    try {
        const statement = new MonthlyStatement({ ...req.body, userId: req.userId });
        const savedStatement = await statement.save();
        res.status(201).json(savedStatement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/monthly-statements/:id', auth, async (req, res) => {
    try {
        const updatedStatement = await MonthlyStatement.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedStatement) return res.status(404).json({ message: 'Monthly statement not found' });
        res.json(updatedStatement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/monthly-statements/:id', auth, async (req, res) => {
    try {
        const deletedStatement = await MonthlyStatement.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedStatement) return res.status(404).json({ message: 'Monthly statement not found' });
        res.json(deletedStatement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Payment routes (calendar/agenda)
app.get('/api/payments', auth, async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.userId });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/payments', auth, async (req, res) => {
    try {
        const payment = new Payment({ ...req.body, userId: req.userId });
        const savedPayment = await payment.save();
        res.status(201).json(savedPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/api/payments/:id', auth, async (req, res) => {
    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedPayment) return res.status(404).json({ message: 'Payment not found' });
        res.json(updatedPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/payments/:id', auth, async (req, res) => {
    try {
        const deletedPayment = await Payment.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!deletedPayment) return res.status(404).json({ message: 'Payment not found' });
        res.json(deletedPayment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}); // <-- Added missing parenthesis and semicolon

// Remove this duplicate User model definition:
// const userSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true }
// });
// const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token });
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
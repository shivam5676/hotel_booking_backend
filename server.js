import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "your_secret_key"; // Change this in production

// Register
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Get all hotels
app.get("/hotels", async (req, res) => {
  const hotels = await prisma.hotel.findMany();
  res.json(hotels);
});

// Book a hotel
app.post("/book", async (req, res) => {
  const { userId, hotelId } = req.body;

  try {
    const booking = await prisma.booking.create({
      data: { userId, hotelId, checkedIn: false },  // Initially checked-in = false
    });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: "Booking failed" });
  }
});

// Get user bookings
app.get("/bookings/:userId", async (req, res) => {
  const { userId } = req.params;
  const bookings = await prisma.booking.findMany({
    where: { userId: parseInt(userId) },
    include: { hotel: true },
  });
  res.json(bookings);
});

// Check-In after booking
app.post("/check-in", async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { checkedIn: true },
    });
    res.json(booking);
  } catch (error) {
    res.status(400).json({ error: "Check-in failed" });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));

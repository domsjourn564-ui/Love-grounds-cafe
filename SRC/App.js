// File: App.js
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// ===== Supabase Setup =====
const supabaseUrl = "YOUR_SUPABASE_URL";   // Replace this
const supabaseKey = "YOUR_SUPABASE_ANON_KEY"; // Replace this
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== App Data =====
const genres = ["Romance", "Self-Help", "Fiction", "Thriller", "Fantasy", "Business"];
const sampleBooks = [
  { title: "Love & Coffee", genre: "Romance" },
  { title: "Atomic Habits", genre: "Self-Help" },
  { title: "The Silent Patient", genre: "Thriller" },
  { title: "Rich Dad Poor Dad", genre: "Business" },
  { title: "The Hobbit", genre: "Fantasy" },
  { title: "The Great Gatsby", genre: "Fiction" }
];

export default function LoveGroundsReadingApp() {
  const [minutes, setMinutes] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [membership, setMembership] = useState("Bronze");
  const [selectedGenre, setSelectedGenre] = useState("Romance");
  const [members, setMembers] = useState([]);
  const [memberName, setMemberName] = useState("");
  const [activeTab, setActiveTab] = useState("user");

  // ===== Timer =====
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setMinutes(prev => prev + 1);
      }, 60000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // ===== Book Recommendations =====
  const recommendations = useMemo(
    () => sampleBooks.filter(book => book.genre === selectedGenre),
    [selectedGenre]
  );

  // ===== Add Member =====
  const handleAddMember = async () => {
    if (!memberName) return alert("Enter member name");
    const { data, error } = await supabase
      .from("members")
      .insert([{ name: memberName, plan: membership, minutes_read: 0 }]);
    if (error) alert(error.message);
    else {
      setMembers([...members, { name: memberName, plan: membership, minutes_read: 0 }]);
      setMemberName("");
      alert("Member added successfully!");
    }
  };

  // ===== Admin Stats =====
  const totalMembers = members.length;
  const totalMinutes = members.reduce((acc, m) => acc + m.minutes_read, 0);

  return (
    <div className="min-h-screen bg-neutral-100 p-6 grid gap-6">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center">
        Love Grounds Reading App
      </motion.h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4">
        <button onClick={() => setActiveTab("user")}>User App</button>
        <button onClick={() => setActiveTab("admin")}>Admin Dashboard</button>
      </div>

      {activeTab === "user" && (
        <>
          {/* Reading Timer */}
          <div className="p-6 bg-white rounded-2xl shadow flex flex-col items-center gap-4">
            <h2 className="text-xl font-semibold">Reading Time Tracker</h2>
            <p className="text-lg">{minutes} minutes</p>
            <div className="flex gap-4">
              <button onClick={() => setIsRunning(true)}>Start</button>
              <button onClick={() => setIsRunning(false)}>Pause</button>
              <button onClick={() => setMinutes(0)}>Reset</button>
            </div>
          </div>

          {/* Membership */}
          <div className="p-6 bg-white rounded-2xl shadow flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Digital Membership</h2>
            <input
              type="text"
              placeholder="Enter Member Name"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
            <select value={membership} onChange={(e) => setMembership(e.target.value)}>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
            </select>
            <button onClick={handleAddMember}>Subscribe & Pay</button>
          </div>

          {/* Book Recommendations */}
          <div className="p-6 bg-white rounded-2xl shadow flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Book Recommendations</h2>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <ul>
              {recommendations.map((book, index) => (
                <li key={index}>{book.title}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Admin Dashboard */}
      {activeTab === "admin" && (
        <div className="p-6 bg-white rounded-2xl shadow flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <p>Total Members: {totalMembers}</p>
          <p>Total Reading Minutes: {totalMinutes}</p>
          <ul>
            {members.map((m, i) => (
              <li key={i}>{m.name} - {m.plan} - {m.minutes_read} min</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

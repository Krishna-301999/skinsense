import React, { useState, useEffect, useRef } from 'react'
import { 
  Calendar as CalIcon, 
  Video, 
  MessageSquare, 
  User, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  Send, 
  ShieldCheck, 
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'
import { API_BASE } from '../App.jsx'

export default function Consultation({ token, triggerToast, user }) {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Booking form state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Active Video Room state
  const [activeRoom, setActiveRoom] = useState(null);
  const [cameraMuted, setCameraMuted] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'doctor', text: "Hello! Welcome to your digital skincare diagnostic consult. How can I help you today?", time: "10:01 AM" }
  ]);
  const [chatInput, setChatInput] = useState('');

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Callback ref to assign srcObject exactly when the local video DOM element mounts
  const localVideoRefCallback = (node) => {
    if (node) {
      localVideoRef.current = node;
      if (localStreamRef.current && activeRoom && !cameraMuted) {
        node.srcObject = localStreamRef.current;
        node.play().catch(err => console.warn("Teleconsultation auto-play failed/interrupted in callback ref:", err));
      }
    }
  };

  useEffect(() => {
    fetchDermatologists();
    fetchAppointmentsHistory();
  }, []);

  // Stop camera feed when closing active call room
  useEffect(() => {
    if (!activeRoom) {
      stopLocalStream();
    }
  }, [activeRoom]);

  // Sync WebRTC stream to DOM video element when call room opens to resolve React race conditions
  useEffect(() => {
    if (activeRoom && localStreamRef.current && !cameraMuted) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(err => console.warn("Teleconsultation auto-play failed/interrupted in useEffect:", err));
      }
    }
  }, [activeRoom, cameraMuted]);

  const fetchDermatologists = async () => {
    try {
      const res = await fetch(`${API_BASE}/dermatologists`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    } catch (err) {
      console.warn("Backend offline. Loading local clinical doctors database.");
      // Fallback fallback doctor data
      setDoctors([
        {
          id: "doc_1",
          name: "Dr. Rashmi Shetty",
          specialty: "Acne & Aesthetic Expert",
          experience: "15 years",
          rating: 4.9,
          availability: ["10:00 AM - 01:00 PM IST", "03:00 PM - 06:00 PM IST"],
          charge: 1200.0,
          avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop",
          bio: "Dr. Shetty is a leading Indian aesthetic dermatologist specializing in Indian skin phototypes, hyperpigmentation, and hormonal acne therapeutics."
        },
        {
          id: "doc_2",
          name: "Dr. Jaishree Sharad",
          specialty: "Cosmetic & Anti-Aging Therapies",
          experience: "20 years",
          rating: 4.8,
          availability: ["11:00 AM - 02:00 PM IST", "04:00 PM - 07:00 PM IST"],
          charge: 1500.0,
          avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
          bio: "Dr. Jaishree is an author and board-certified cosmetic dermatologist, specializing in Indian skin aging patterns, collagen boosting, and advanced laser therapies."
        }
      ]);
    }
  };

  const fetchAppointmentsHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/appointments/history`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.warn("Backend offline. Running simulated local calendar.");
      // Simulated initial booking
      setAppointments([
        {
          id: "apt_72b38cd",
          user_id: user?.id || "usr_offline",
          doctor_id: "doc_1",
          doctor_name: "Dr. Rashmi Shetty",
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time_slot: "10:00 AM - 10:30 AM IST",
          status: "Scheduled",
          room_id: "room_mock_72a29bc",
          notes: "Inspecting acne scars.",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Submit appointment booking details
  const handleBookConsultation = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      triggerToast("Please complete all booking inputs.", "error");
      return;
    }

    const payload = {
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.name,
      date: selectedDate,
      time_slot: selectedSlot,
      notes: appointmentNotes
    };

    try {
      const res = await fetch(`${API_BASE}/book-consultation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerToast("Clinical consultation scheduled successfully!", "success");
        setSelectedDoctor(null);
        setSelectedDate('');
        setSelectedSlot('');
        setAppointmentNotes('');
        fetchAppointmentsHistory();
      } else {
        const data = await res.json();
        triggerToast(data.detail || "Booking failed", "error");
      }
    } catch (err) {
      // Local fallback simulation
      const mockApt = {
        id: `apt_${Math.random().toString(36).substr(2, 7)}`,
        user_id: user?.id || "usr_offline",
        doctor_id: selectedDoctor.id,
        doctor_name: selectedDoctor.name,
        date: selectedDate,
        time_slot: selectedSlot,
        status: "Scheduled",
        room_id: `room_${Math.random().toString(36).substr(2, 12)}`,
        notes: appointmentNotes,
        created_at: new Date().toISOString()
      };

      triggerToast("Offline Mode: Simulated appointment reservation confirmed!", "success");
      setAppointments(prev => [mockApt, ...prev]);
      setSelectedDoctor(null);
      setSelectedDate('');
      setSelectedSlot('');
      setAppointmentNotes('');
    }
  };

  // Launch WebRTC and local camera streams
  const joinCallRoom = async (apt) => {
    triggerToast("Starting high fidelity WebRTC simulator...", "success");

    // Attempt to hook active user webcam stream
    try {
      let stream;
      try {
        const constraints = {
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: "user" 
          },
          audio: true
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (innerErr) {
        console.warn("Standard teleconsultation video constraints failed, retrying with simple constraints...", innerErr);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      }
      localStreamRef.current = stream;
      setCameraMuted(false);
      setMicMuted(false);
    } catch (err) {
      console.warn("Camera feed rejected or unavailable:", err);
      triggerToast("WebRTC Active: Camera stream block bypassed. Remote connection functional.", "info");
    }

    // Set active room AFTER securing the stream to resolve React mounting race conditions
    setActiveRoom(apt);
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  const leaveCallRoom = () => {
    stopLocalStream();
    setActiveRoom(null);
    triggerToast("Video session ended.", "info");
  };

  // Simulated WebRTC inside-call chat messages submit
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulated doctor response
    setTimeout(() => {
      const doctorMsg = {
        sender: 'doctor',
        text: "I see your facial mapping shows minor dry cheeks under-eye sectors. We'll adjust your Retinol night dosage to 0.2% concentration.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, doctorMsg]);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans select-none relative h-full">
      
      {/* ========================================================================= */}
      {/* 1. ACTIVE WEBRTC VIDEO CALL OVERLAY SIMULATOR */}
      {activeRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col md:flex-row h-full w-full no-print">
          
          {/* Main Visual Feeds Area */}
          <div className="flex-1 flex flex-col relative h-[65%] md:h-full justify-between p-4">
            
            {/* Header bar indicators */}
            <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 z-10 w-full max-w-lg mx-auto shadow-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">Agora active room</span>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold">{activeRoom.doctor_name} Consult</span>
            </div>

            {/* Viewports Split Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-16 relative">
              
              {/* Patient Local Stream */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative shadow-2xl">
                {cameraMuted ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <VideoOff className="w-10 h-10" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Video stream stopped</span>
                  </div>
                ) : (
                  <video 
                    ref={localVideoRefCallback} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100" 
                  />
                )}
                <span className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded px-2.5 py-1 text-[8px] font-bold uppercase text-white tracking-widest shadow">
                  Patient (You)
                </span>
              </div>

              {/* Doctor Remote Stream Simulator */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 relative shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop" 
                  alt="Clinician Video" 
                  className="w-full h-full object-cover filter brightness-105"
                />
                
                {/* Simulated doctor laser focus indicator overlay */}
                <div className="absolute inset-x-20 top-20 bottom-16 border border-brand-accent/20 border-dashed rounded-full pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border border-brand-accent/40 rounded-full animate-ping"></div>
                </div>

                <span className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded px-2.5 py-1 text-[8px] font-bold uppercase text-white tracking-widest shadow flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> {activeRoom.doctor_name}
                </span>
              </div>

            </div>

            {/* Bottom Controls panel bar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-850 px-6 py-3 rounded-full flex gap-4 shadow-2xl items-center relative z-20">
              <button 
                onClick={() => setMicMuted(!micMuted)}
                className={`p-3.5 rounded-full text-white shadow-xl hover:scale-110 transition-transform ${micMuted ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                {micMuted ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
              </button>

              <button 
                onClick={() => setCameraMuted(!cameraMuted)}
                className={`p-3.5 rounded-full text-white shadow-xl hover:scale-110 transition-transform ${cameraMuted ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-800 hover:bg-slate-700'}`}
              >
                {cameraMuted ? <VideoOff className="w-4.5 h-4.5" /> : <Video className="w-4.5 h-4.5" />}
              </button>

              <button 
                onClick={leaveCallRoom}
                className="p-3.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-2xl hover:scale-115 active:scale-95 transition-all"
              >
                <PhoneOff className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>

          {/* Call Chat sidebar pane */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-850 bg-slate-950 flex flex-col h-[35%] md:h-full text-left p-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 leading-none flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-brand-500" /> Patient Consultation Notes</h4>
            
            {/* Chats messages window */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-2">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] px-3 py-2 rounded-xl text-[10px] leading-relaxed ${m.sender === 'user' ? 'bg-brand-500 text-white rounded-tr-none' : 'bg-slate-850 text-slate-350 rounded-tl-none border border-slate-800'}`}>
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[8px] text-slate-500 mt-1 mx-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Chat form send footer */}
            <form onSubmit={sendChatMessage} className="flex gap-1.5 border-t border-slate-850 pt-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send message to clinician..."
                className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-[10px] font-semibold focus:outline-none focus:border-brand-500 text-white"
              />
              <button type="submit" className="p-2 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
      {/* ========================================================================= */}

      {/* 2. Normal View: Scheduler Catalog and Scheduled Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Book appointment form panel */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-2 leading-none flex items-center gap-2">
            <CalIcon className="w-5 h-5 text-brand-500 animate-float" /> Schedule Skin Consultation
          </h3>
          <p className="text-xs text-slate-400 font-semibold leading-none mb-6">Select a clinical dermatologist and calendar slot to book your video call.</p>
          
          <form onSubmit={handleBookConsultation} className="space-y-4 text-left">
            
            {/* Select Doctor Profile radio list */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Select Clinical Expert</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoctor(doc);
                      setSelectedSlot('');
                    }}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                      selectedDoctor?.id === doc.id 
                        ? 'bg-brand-500/10 border-brand-500/30 ring-1 ring-brand-500/30' 
                        : 'bg-slate-50 dark:bg-slate-950/80 border-slate-100 dark:border-slate-900 hover:bg-slate-100/50'
                    }`}
                  >
                    <img src={doc.avatar} alt={doc.name} className="w-11 h-11 object-cover rounded-xl border border-slate-100 dark:border-slate-900" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-150 leading-none">{doc.name}</p>
                      <p className="text-[9px] text-brand-500 mt-1 font-semibold leading-none">{doc.specialty}</p>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white mt-1.5">₹{doc.charge.toFixed(0)} / session</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pick slots and date */}
            {selectedDoctor && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-float-in">
                
                {/* Date Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Select Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-850 dark:text-white"
                  />
                </div>

                {/* Available Hours list */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Select Hours Slot</label>
                  <div className="flex gap-2">
                    {selectedDoctor.availability.map((slot, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex-1 text-center py-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                          selectedSlot === slot 
                            ? 'bg-brand-500 text-white border-brand-500 shadow-glow' 
                            : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50'
                        }`}
                      >
                        {slot.split(' - ')[0]}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Custom Notes */}
            {selectedDoctor && (
              <div className="space-y-1.5 animate-float-in">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Diagnostics Target / Symptoms description</label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Describe your active dry sectors, acne spots, or skin barrier goals..."
                  rows="2.5"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-brand-500 dark:text-white"
                />
              </div>
            )}

            {selectedDoctor && (
              <button
                type="submit"
                className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-accent hover:from-brand-500 hover:to-brand-accent text-white font-extrabold text-xs shadow-glow transition-all hover:scale-102 active:scale-98 text-center uppercase tracking-widest animate-float-in"
              >
                Confirm Appointment Slot
              </button>
            )}

          </form>
        </div>

        {/* Booked schedules timeline card listing */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-glass-light dark:shadow-glass-dark flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 leading-none">Your Scheduled Consults</h3>
          
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-1">
            {loading ? (
              <div className="w-full h-12 rounded-2xl bg-slate-100 animate-pulse"></div>
            ) : appointments.length === 0 ? (
              <div className="text-center p-8 space-y-3">
                <Clock className="w-10 h-10 text-slate-300 mx-auto animate-float" />
                <p className="text-[10px] text-slate-550 font-bold leading-normal max-w-44 mx-auto uppercase">No booked appointments logged.</p>
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl text-left space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-150 leading-none">{apt.doctor_name}</p>
                      <span className="text-[8px] text-brand-500 mt-1 font-bold block">Agora room: {apt.id}</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/10">Scheduled</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
                    <CalIcon className="w-3.5 h-3.5 text-brand-500" />
                    <span>{apt.date} @ {apt.time_slot.split(' - ')[0]}</span>
                  </div>

                  <button
                    onClick={() => joinCallRoom(apt)}
                    className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs shadow-glow transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <Video className="w-4 h-4 animate-bounce" /> Join Video Call Room
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  )
}

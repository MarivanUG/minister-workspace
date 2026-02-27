import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { collection, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import MySermons from './pages/MySermons';
import BibleStudy from './pages/BibleStudy';
import ExternalSermons from './pages/ExternalSermons';
import BibleLibrary from './pages/BibleLibrary';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';
import DocumentSummarizer from './pages/DocumentSummarizer';
import SermonPrepWizard from './pages/SermonPrepWizard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminConfig, setAdminConfig] = useState({ username: 'admin', password: 'password123' });
  const [loading, setLoading] = useState(true);

  // Global State for data
  const [sermons, setSermons] = useState([]);
  const [studies, setStudies] = useState([]);
  const [externalSermons, setExternalSermons] = useState([]);

  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubs = [];
    let loadCount = 0;

    const checkLoaded = () => {
      loadCount++;
      if (loadCount === 3) setLoading(false);
    };

    const handleError = (err) => {
      console.error("Firebase subscription error:", err);
      setError("Database access denied. Please check Firestore Rules.");
      setLoading(false);
    };

    const fetchConfig = async () => {
      try {
        const configRef = doc(db, 'config', 'minister_admin');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          setAdminConfig(configSnap.data());
        } else {
          const defaultConfig = { username: 'admin', password: 'admin123' };
          await setDoc(configRef, defaultConfig);
          setAdminConfig(defaultConfig);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        if (error.code === 'permission-denied') {
          setError("Database access denied. Please update Firebase Security Rules.");
        }
      }
    };

    fetchConfig();

    // Setup real-time listeners for all 3 collections
    unsubs.push(onSnapshot(collection(db, 'sermons'), (snapshot) => {
      setSermons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.createdAt - a.createdAt));
      checkLoaded();
    }, handleError));

    unsubs.push(onSnapshot(collection(db, 'bible_studies'), (snapshot) => {
      setStudies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.createdAt - a.createdAt));
      checkLoaded();
    }, handleError));

    unsubs.push(onSnapshot(collection(db, 'external_sermons'), (snapshot) => {
      setExternalSermons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => b.createdAt - a.createdAt));
      checkLoaded();
    }, handleError));

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const handleLogin = (username, password) => {
    if (username === adminConfig.username && password === adminConfig.password) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-indigo-50/50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-indigo-100">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="text-left bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
            <p className="font-bold text-gray-700 mb-2">Please add these rules to Firebase:</p>
            <pre className="text-xs text-rose-600 overflow-x-auto">
              {`match /sermons/{doc} { allow read, write: if true; }
match /bible_studies/{doc} { allow read, write: if true; }
match /external_sermons/{doc} { allow read, write: if true; }
match /config/minister_admin { allow read, write: if true; }`}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50/50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-indigo-900 font-bold tracking-wide">Loading Workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-[#f8fafc] text-gray-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Toaster position="top-right" />
        <Sidebar onLogout={handleLogout} />

        <main className="flex-1 p-6 md:p-10 lg:pl-16 overflow-y-auto w-full max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard sermons={sermons} studies={studies} externalSermons={externalSermons} />} />
            <Route path="/sermons" element={<MySermons records={sermons} collectionName="sermons" />} />
            <Route path="/bible-study" element={<BibleStudy records={studies} collectionName="bible_studies" />} />
            <Route path="/external-sermons" element={<ExternalSermons records={externalSermons} collectionName="external_sermons" />} />
            <Route path="/bible-library" element={<BibleLibrary />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/summarizer" element={<DocumentSummarizer />} />
            <Route path="/wizard" element={<SermonPrepWizard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

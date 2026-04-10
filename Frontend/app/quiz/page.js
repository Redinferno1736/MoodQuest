'use client';

import React, { useState } from 'react';
import { Bell, Home, TrendingUp, Heart, Settings, HelpCircle, User, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function QuizAssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [questionnaires, setQuestionnaires] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // ── Auth guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login');
  }, [status, router]);

  // Available questionnaires info
  const quizInfo = {
    "PHQ-9": {
      name: "PHQ-9",
      fullName: "Patient Health Questionnaire",
      description: "Depression screening assessment",
      color: "from-blue-400 to-blue-500",
      emoji: "😔"
    },
    "GAD-7": {
      name: "GAD-7",
      fullName: "Generalized Anxiety Disorder",
      description: "Anxiety screening assessment",
      color: "from-purple-400 to-purple-500",
      emoji: "😰"
    },
    "PSS": {
      name: "PSS",
      fullName: "Perceived Stress Scale",
      description: "Stress level assessment",
      color: "from-orange-400 to-orange-500",
      emoji: "😓"
    }
  };

  // Fetch questionnaire from backend
  const fetchQuestionnaire = async (quizName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questionnaire/${quizName}`);
      if (!response.ok) throw new Error('Failed to fetch questionnaire');
      const data = await response.json();

      const transformedQuestions = data.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options.map((val) => {
          if (quizName === 'PSS') {
            const labels = ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"];
            return labels[val] || `Option ${val}`;
          } else {
            const labels = ["Not at all", "Several days", "More than half the days", "Nearly every day"];
            return labels[val] || `Option ${val}`;
          }
        })
      }));

      setQuestionnaires(prev => ({
        ...prev,
        [quizName]: { ...quizInfo[quizName], questions: transformedQuestions }
      }));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching questionnaire:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit answers to backend
  const submitAnswers = async (quizName, answerValues) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questionnaire/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: quizName, answers: answerValues })
      });
      if (!response.ok) throw new Error('Failed to submit questionnaire');
      const data = await response.json();
      setResults(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error submitting questionnaire:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (interpretation) => {
    const lower = interpretation.toLowerCase();
    if (lower.includes('minimal') || lower.includes('low')) return 'from-green-400 to-emerald-500';
    if (lower.includes('mild') || lower.includes('moderate')) return 'from-yellow-400 to-orange-400';
    if (lower.includes('severe') || lower.includes('high')) return 'from-red-500 to-red-600';
    return 'from-blue-400 to-blue-500';
  };

  const getResultMessage = (interpretation) => {
    const lower = interpretation.toLowerCase();
    if (lower.includes('minimal') || lower.includes('low')) return "You're doing great! Keep up with healthy habits.";
    if (lower.includes('mild')) return "Consider self-care activities and monitoring your mood.";
    if (lower.includes('moderate')) return "Consider speaking with a healthcare professional.";
    if (lower.includes('severe') || lower.includes('high')) return "Please seek professional help for support.";
    return "Thank you for completing the assessment.";
  };

  const handleStartQuiz = async (quizKey) => {
    setSelectedQuiz(quizKey);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedOption(null);
    setResults(null);
    if (!questionnaires[quizKey]) await fetchQuestionnaire(quizKey);
  };

  const handleAnswerSelect = (optionIndex) => setSelectedOption(optionIndex);

  const handleNext = async () => {
    if (selectedOption !== null) {
      const newAnswers = [...answers, selectedOption];
      setAnswers(newAnswers);
      if (currentQuestion < questionnaires[selectedQuiz].questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        const result = await submitAnswers(selectedQuiz, newAnswers);
        if (result) setShowResults(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1]);
      const newAnswers = [...answers];
      newAnswers.pop();
      setAnswers(newAnswers);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedOption(null);
    setResults(null);
  };

  const handleBackToSelection = () => {
    setSelectedQuiz(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setSelectedOption(null);
    setResults(null);
  };

  // ── Loading / unauthenticated gates ───────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Loader2 className="w-12 h-12 animate-spin text-lime-600" />
      </div>
    );
  }
  if (status === 'unauthenticated') return null;

  const userName = session?.user?.name || 'USER';

  const renderQuizSelection = () => (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-black text-gray-900 mb-4">CHOOSE YOUR ASSESSMENT</h2>
          <p className="text-xl text-gray-600 font-bold">Select a questionnaire to begin your mental health check-in</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl">
            <p className="font-bold">Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {Object.keys(quizInfo).map((key) => {
            const quiz = quizInfo[key];
            return (
              <div key={key} className={`bg-gradient-to-br ${quiz.color} p-8 rounded-3xl shadow-lg text-white transform hover:scale-105 transition-transform cursor-pointer`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{quiz.emoji}</div>
                  <h3 className="text-3xl font-black mb-2">{quiz.name}</h3>
                  <p className="text-xl font-bold mb-1">{quiz.fullName}</p>
                  <p className="text-lg mb-4 opacity-90">{quiz.description}</p>
                  <p className="text-sm font-bold mb-6">
                    {key === 'PSS' ? '10' : key === 'GAD-7' ? '7' : '9'} Questions
                  </p>
                  <button
                    onClick={() => handleStartQuiz(key)}
                    disabled={loading}
                    className="w-full px-6 py-4 bg-white text-gray-900 font-black text-lg rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'LOADING...' : 'START ASSESSMENT'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-lime-100 p-8 rounded-3xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">IMPORTANT NOTE</h3>
              <p className="text-gray-700 font-bold leading-relaxed">
                These assessments are screening tools and do not provide a diagnosis. If you&apos;re experiencing mental health concerns,
                please consult with a qualified healthcare professional. Your responses are confidential and stored securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizQuestions = () => {
    if (!questionnaires[selectedQuiz]) {
      return (
        <div className="p-8 text-center">
          <p className="text-2xl font-bold text-gray-600">Loading questions...</p>
        </div>
      );
    }

    const quiz = questionnaires[selectedQuiz];
    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToSelection}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            BACK TO QUIZZES
          </button>

          <div className={`bg-gradient-to-br ${quiz.color} p-6 rounded-3xl shadow-lg text-white mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black">{quiz.name}</h2>
                <p className="text-lg font-bold opacity-90">{quiz.fullName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold opacity-90">Question</p>
                <p className="text-4xl font-black">{currentQuestion + 1}/{quiz.questions.length}</p>
              </div>
            </div>
            <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
              <div className="bg-white h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl">
              <p className="font-bold">Error: {error}</p>
            </div>
          )}

          <div className="bg-white p-8 rounded-3xl shadow-lg mb-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6">{question.question}</h3>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-5 rounded-2xl font-bold text-left transition-all ${
                    selectedOption === index
                      ? 'bg-lime-500 text-white shadow-lg transform scale-105'
                      : 'bg-lime-50 text-gray-900 hover:bg-lime-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{option}</span>
                    {selectedOption === index && <CheckCircle size={24} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex-1 px-6 py-4 font-black text-lg rounded-full flex items-center justify-center gap-2 transition-colors ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-900 hover:bg-gray-400'
              }`}
            >
              <ArrowLeft size={24} />
              PREVIOUS
            </button>
            <button
              onClick={handleNext}
              disabled={selectedOption === null || loading}
              className={`flex-1 px-6 py-4 font-black text-lg rounded-full flex items-center justify-center gap-2 transition-colors ${
                selectedOption === null || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-lime-500 text-white hover:bg-lime-600'
              }`}
            >
              {loading ? 'SUBMITTING...' : currentQuestion === quiz.questions.length - 1 ? 'FINISH' : 'NEXT'}
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) {
      return (
        <div className="p-8 text-center">
          <p className="text-2xl font-bold text-gray-600">Loading results...</p>
        </div>
      );
    }

    const quiz = questionnaires[selectedQuiz];
    const resultColor = getResultColor(results.interpretation);
    const resultMessage = getResultMessage(results.interpretation);

    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-5xl font-black text-gray-900 mb-2">ASSESSMENT COMPLETE!</h2>
            <p className="text-xl text-gray-600 font-bold">{quiz.fullName}</p>
          </div>

          <div className={`bg-gradient-to-br ${resultColor} p-8 rounded-3xl shadow-lg text-white mb-6`}>
            <div className="text-center">
              <p className="text-lg font-bold opacity-90 mb-2">Your Total Score</p>
              <p className="text-7xl font-black mb-4">{results.score}</p>
              <p className="text-3xl font-black mb-4">{results.interpretation}</p>
              <p className="text-xl font-bold">{resultMessage}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg text-center">
              <p className="text-gray-600 font-bold mb-2">Questions</p>
              <p className="text-4xl font-black text-gray-900">{quiz.questions.length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-lg text-center">
              <p className="text-gray-600 font-bold mb-2">Your Score</p>
              <p className="text-4xl font-black text-gray-900">{results.score}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-lg text-center">
              <p className="text-gray-600 font-bold mb-2">Max Score</p>
              <p className="text-4xl font-black text-gray-900">
                {selectedQuiz === 'PSS' ? 40 : selectedQuiz === 'GAD-7' ? 21 : 27}
              </p>
            </div>
          </div>

          <div className="bg-lime-100 p-8 rounded-3xl mb-6">
            <h3 className="text-2xl font-black text-gray-900 mb-4">WHAT&apos;S NEXT?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <p className="text-gray-900 font-bold">Save your results for future reference and tracking</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <p className="text-gray-900 font-bold">Share results with your healthcare provider if needed</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <p className="text-gray-900 font-bold">Explore our resources and self-care tips</p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <p className="text-gray-900 font-bold">Take another assessment to get a complete picture</p>
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleRetakeQuiz}
              className="flex-1 px-6 py-4 bg-gray-300 text-gray-900 font-black text-lg rounded-full hover:bg-gray-400 transition-colors"
            >
              RETAKE QUIZ
            </button>
            <button
              onClick={handleBackToSelection}
              className="flex-1 px-6 py-4 bg-lime-500 text-white font-black text-lg rounded-full hover:bg-lime-600 transition-colors"
            >
              TRY ANOTHER QUIZ
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-800">
      {/* Sidebar */}
      <div className="w-64 bg-lime-200 flex flex-col">
        <div className="bg-gray-900 text-white p-6 text-center">
          <h1 className="text-2xl font-black tracking-wide">DASHBOARD</h1>
          <p className="text-sm font-bold text-lime-400 mt-2 truncate">{userName}</p>
        </div>

        <nav className="flex-1 py-4">
          <Link href="/dashboard" className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300 transition-colors">
            <Home size={24} />HOME
          </Link>
          <Link href="/analysis" className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300 transition-colors">
            <TrendingUp size={24} />ANALYSIS
          </Link>
          <Link href="/pet" className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300 transition-colors">
            <Heart size={24} />PET SUPPORT
          </Link>
          <Link href="/settings" className="w-full px-6 py-4 text-left font-black text-xl flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300 transition-colors">
            <Settings size={24} />SETTINGS
          </Link>
        </nav>

        <div className="border-t-2 border-lime-400">
          <Link href="/help" className="w-full px-6 py-4 text-left font-black text-lg flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300">
            <HelpCircle size={20} />HELP
          </Link>
          <Link href="/profile" className="w-full px-6 py-4 text-left font-black text-lg flex items-center gap-3 bg-lime-200 text-gray-900 hover:bg-lime-300">
            <User size={20} />PROFILE
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 overflow-auto">
        {/* Header */}
        <div className="bg-white px-8 py-6 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-4xl font-black text-gray-900">QUICK QUIZ</h1>
            <p className="text-gray-600 font-bold mt-1">Take a mental health assessment</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-lime-200 rounded-full hover:bg-lime-300 transition-colors">
              <Bell size={24} className="text-gray-900" />
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-8 py-3 bg-lime-500 text-white font-black text-xl rounded-full hover:bg-lime-600 transition-colors"
            >
              LOG OUT
            </button>
          </div>
        </div>

        {/* Content */}
        {!selectedQuiz && renderQuizSelection()}
        {selectedQuiz && !showResults && renderQuizQuestions()}
        {selectedQuiz && showResults && renderResults()}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiAward,
  FiCheckCircle,
  FiClock,
  FiHelpCircle,
  FiAlertCircle,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import styles from './page.module.css';

export default function SkillAssessmentPage() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    api
      .get('/quizzes')
      .then(({ data }) => setQuizzes(data.quizzes || []))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  // Timer countdown when active quiz is running
  useEffect(() => {
    if (!activeQuiz || quizResult) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, quizResult]);

  const startQuiz = async (topicId) => {
    if (!user) {
      addToast('Please log in to take skill assessments and earn verified badges', 'error');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/quizzes/${topicId}`);
      setQuizData(data.quiz);
      setActiveQuiz(topicId);
      setSelectedAnswers({});
      setQuizResult(null);
      setTimeLeft(data.quiz.timeLimit * 60);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to start quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/quizzes/${activeQuiz}/submit`, {
        answers: selectedAnswers,
      });
      setQuizResult(data);
      if (data.passed) {
        addToast(`🎉 Awesome! You scored ${data.score}% and earned the Verified Badge!`, 'success');
      } else {
        addToast(`You scored ${data.score}%. Need 80% to earn badge. Try again!`, 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      {!activeQuiz && (
        <div className={styles.header}>
          <span className="glow-pill"><FiAward size={12} /> Skill Verification</span>
          <h1 className={styles.title}>Skill Assessment & Badges</h1>
          <p className={styles.subtitle}>
            Prove your technical expertise with 10-minute skill tests. Score 80%+ to unlock a permanent <strong>Verified Expert</strong> badge on your profile.
          </p>
        </div>
      )}

      {/* 1. Quiz Catalog List */}
      {!activeQuiz && (
        <>
          {loading ? (
            <div className={styles.grid}>
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" />)}
            </div>
          ) : (
            <div className={styles.grid}>
              {quizzes.map((q) => {
                const userHasBadge = user?.badges?.some((b) => b.category === q.category);
                return (
                  <Card key={q.topicId} hover className={styles.quizCard}>
                    <div className={styles.quizIconWrap}>{q.badgeIcon || '⚡'}</div>
                    <div className={styles.quizInfo}>
                      <span className={styles.quizCategory}>{q.category?.replace('-', ' ')}</span>
                      <h3 className={styles.quizTitle}>{q.title}</h3>

                      <div className={styles.quizMeta}>
                        <span><FiClock size={13} /> {q.timeLimit} mins</span>
                        <span>•</span>
                        <span><FiHelpCircle size={13} /> {q.questionsCount} Questions</span>
                        <span>•</span>
                        <span>Passing: {q.passingScore}%</span>
                      </div>

                      {userHasBadge ? (
                        <div className={styles.badgeEarnedRow}>
                          <FiCheckCircle className={styles.checkIcon} />
                          <span>Verified Expert Badge Earned</span>
                        </div>
                      ) : (
                        <Button
                          full
                          onClick={() => startQuiz(q.topicId)}
                          style={{ marginTop: '1.25rem' }}
                        >
                          Start Assessment <FiArrowRight size={14} />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 2. Active Test Runner */}
      {activeQuiz && quizData && !quizResult && (
        <div className={styles.testContainer}>
          <div className={styles.testHeader}>
            <div>
              <span className={styles.badgePill}>{quizData.badgeIcon} Assessment in Progress</span>
              <h2>{quizData.title}</h2>
            </div>
            <div className={styles.timerBox}>
              <FiClock size={18} />
              <span className={styles.timer}>{formatTimer(timeLeft)}</span>
            </div>
          </div>

          <div className={styles.questionsList}>
            {quizData.questions.map((q, idx) => (
              <div key={q.id} className={styles.questionCard}>
                <h4 className={styles.questionText}>
                  <span>{idx + 1}.</span> {q.question}
                </h4>
                <div className={styles.optionsList}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    return (
                      <label
                        key={optIdx}
                        className={`${styles.optionLabel} ${isSelected ? styles.optionSelected : ''}`}
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={isSelected}
                          onChange={() => handleSelectAnswer(q.id, optIdx)}
                          className={styles.radioInput}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.testFooter}>
            <Button
              variant="secondary"
              onClick={() => {
                if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  setActiveQuiz(null);
                }
              }}
            >
              Exit Test
            </Button>
            <Button size="lg" disabled={submitting} onClick={handleSubmitQuiz}>
              {submitting ? 'Submitting Answers...' : 'Submit Assessment'}
            </Button>
          </div>
        </div>
      )}

      {/* 3. Quiz Results View */}
      {quizResult && (
        <div className={styles.resultContainer}>
          <Card className={styles.resultCard}>
            <div className={styles.resultIcon}>
              {quizResult.passed ? '🏆' : '📚'}
            </div>
            <h2 className={styles.resultTitle}>
              {quizResult.passed ? 'Congratulations! You Passed!' : 'Assessment Completed'}
            </h2>
            <p className={styles.resultScore}>
              Your Score: <strong>{quizResult.score}%</strong> ({quizResult.correctCount} of {quizResult.totalQuestions} correct)
            </p>

            {quizResult.passed ? (
              <div className={styles.badgeAwardBox}>
                <div className={styles.badgeBigIcon}>{quizResult.badgeAwarded?.badgeIcon || '⚡'}</div>
                <div>
                  <h4>{quizResult.badgeAwarded?.name}</h4>
                  <p>Badge permanently added to your SkillBridge profile.</p>
                </div>
              </div>
            ) : (
              <p className={styles.tryAgainText}>
                You need at least 80% to earn the badge. Review the concepts and try again!
              </p>
            )}

            <div className={styles.resultActions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveQuiz(null);
                  setQuizResult(null);
                }}
              >
                Back to All Quizzes
              </Button>
              <Link href="/settings">
                <Button>View Profile & Badges</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

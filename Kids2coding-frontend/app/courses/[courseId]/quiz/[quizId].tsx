import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { AppText } from "../../../../src/components/AppText";
import { ScreenWrapper } from "../../../../src/components/ScreenWrapper";
import { Colors } from "../../../../src/constants/colors";
import { ChevronLeft, ChevronRight, Clock, HelpCircle, CheckCircle } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useProgress } from "../../../../src/hooks/useProgress";
import { getCourseById } from "../../../../src/services/coursesService";

export default function QuizScreen() {
  const { courseId, quizId } = useLocalSearchParams();
  const router = useRouter();
  const { saveQuizResult, getQuizScore } = useProgress();

  const [course, setCourse] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [existingScore, setExistingScore] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (courseId && quizId) {
      const score = getQuizScore(courseId as string, quizId as string);
      if (score) {
        setExistingScore(score);
        setQuizCompleted(true);
      }
    }
  }, [courseId, quizId, getQuizScore]);

  // Timer effect
  useEffect(() => {
    if (!quizCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, quizCompleted]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(courseId as string);
      setCourse(courseData);
      
      if (courseData?.quizzes) {
        // Convert quizzes object to array and find the matching quiz
        const quizzesArray = Object.keys(courseData.quizzes).map(key => ({
          id: key,
          ...courseData.quizzes[key]
        }));
        const foundQuiz = quizzesArray.find(q => q.id === quizId);
        setQuiz(foundQuiz);
        
        if (foundQuiz?.questions) {
          setSelectedAnswers(new Array(foundQuiz.questions.length).fill(-1));
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeOut = () => {
    Alert.alert(
      "Time's Up! ⏰",
      "The quiz time has expired. Your answers will be submitted automatically.",
      [{ text: "OK", onPress: handleSubmit }]
    );
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions?.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    // Check if all questions answered
    if (selectedAnswers.includes(-1)) {
      Alert.alert(
        "Incomplete",
        "Please answer all questions before submitting.",
        [{ text: "OK" }]
      );
      return;
    }

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Save to Firebase
    saveQuizResult(courseId as string, quizId as string, correctCount, totalQuestions);

    Alert.alert(
      "Quiz Submitted! 🎉",
      `You scored ${correctCount} out of ${totalQuestions} (${percentage}%)\n+${Math.round((correctCount / totalQuestions) * 20)} XP earned!`,
      [
        {
          text: "Back to Course",
          onPress: () => router.push(`/courses/${courseId}`),
        },
      ]
    );

    setQuizCompleted(true);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <AppText style={styles.loadingText}>Loading quiz...</AppText>
        </View>
      </ScreenWrapper>
    );
  }

  if (!course || !quiz) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <AppText>Quiz not found</AppText>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <AppText style={styles.backButtonText}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  // If quiz already completed
  if (quizCompleted && existingScore) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <CheckCircle size={60} color={Colors.success} />
          <AppText style={styles.completedTitle}>Quiz Completed!</AppText>
          <AppText style={styles.completedScore}>
            You scored {existingScore.score}/{existingScore.total}
          </AppText>
          <AppText style={styles.completedXP}>
            +{Math.round((existingScore.score / existingScore.total) * 20)} XP earned
          </AppText>
          <TouchableOpacity 
            style={styles.backToCourse}
            onPress={() => router.push(`/courses/${courseId}`)}
          >
            <AppText style={styles.backToCourseText}>Back to Course</AppText>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestion];

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <AppText style={styles.quizTitle}>{quiz.title}</AppText>
            <AppText style={styles.courseTitle}>{course.title}</AppText>
          </View>
          <View style={styles.timer}>
            <Clock size={20} color={timeLeft < 60 ? Colors.error : Colors.textLight} />
            <AppText style={[styles.timerText, timeLeft < 60 && styles.timerWarning]}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </AppText>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <AppText style={styles.progressText}>
            Question {currentQuestion + 1} of {questions.length}
          </AppText>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentQuestion + 1) / questions.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Question */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <HelpCircle size={24} color={Colors.primary} />
              <AppText style={styles.questionNumber}>Question {currentQuestion + 1}</AppText>
            </View>
            <AppText style={styles.questionText}>{currentQ.question}</AppText>

            <View style={styles.optionsContainer}>
              {currentQ.options.map((option: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.option,
                    selectedAnswers[currentQuestion] === index && styles.selectedOption
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                >
                  <View style={styles.optionRadio}>
                    {selectedAnswers[currentQuestion] === index && (
                      <View style={styles.optionRadioInner} />
                    )}
                  </View>
                  <AppText style={styles.optionText}>{option}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.navButton, currentQuestion === 0 && styles.disabledButton]} 
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft size={20} color={currentQuestion === 0 ? Colors.textLight : Colors.primary} />
            <AppText style={[styles.navButtonText, currentQuestion === 0 && styles.disabledText]}>
              Previous
            </AppText>
          </TouchableOpacity>

          {currentQuestion === questions.length - 1 ? (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <AppText style={styles.submitButtonText}>Submit Quiz</AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.navButton}
              onPress={handleNext}
            >
              <AppText style={styles.navButtonText}>Next</AppText>
              <ChevronRight size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.textLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  courseTitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    marginLeft: 5,
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
  },
  timerWarning: {
    color: Colors.error,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginLeft: 10,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 30,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    color: Colors.primary,
    marginHorizontal: 8,
  },
  disabledText: {
    color: Colors.textLight,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
  },
  completedScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 10,
  },
  completedXP: {
    fontSize: 18,
    color: Colors.success,
    marginTop: 5,
  },
  backToCourse: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backToCourseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
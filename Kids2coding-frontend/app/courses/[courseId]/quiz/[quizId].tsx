import { useLocalSearchParams, useRouter } from "expo-router";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { AppText } from "../../../../src/components/AppText";
import { ScreenWrapper } from "../../../../src/components/ScreenWrapper";
import { Colors } from "../../../../src/constants/colors";
import { coursesData, courseDetails } from "../../../../src/data/coursesData";
import { ChevronLeft, ChevronRight, Clock, HelpCircle } from "lucide-react-native";
import { useState } from "react";

export default function QuizScreen() {
  const { courseId, quizId } = useLocalSearchParams();
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  const course = coursesData.find(c => c.id === courseId);
  const details = courseDetails[courseId as string];
  const quiz = details?.quizzes?.find(q => q.id === quizId);

  // Mock questions for the quiz
  const questions = [
    {
      id: 1,
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "High Tech Modern Language",
        "Hyper Transfer Markup Language",
        "Home Tool Markup Language"
      ],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: "Which tag is used to create a hyperlink?",
      options: ["<link>", "<a>", "<href>", "<url>"],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: "What is the correct way to comment in HTML?",
      options: [
        "// This is a comment",
        "<!-- This is a comment -->",
        "/* This is a comment */",
        "# This is a comment"
      ],
      correctAnswer: 1,
    },
  ];

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
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        score++;
      }
    });

    Alert.alert(
      "Quiz Submitted!",
      `You scored ${score} out of ${questions.length}`,
      [
        {
          text: "Back to Course",
          onPress: () => router.push(`/courses/${courseId}`),
        },
      ]
    );
  };

  if (!course || !quiz) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <AppText>Quiz not found</AppText>
        </View>
      </ScreenWrapper>
    );
  }

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
            <Clock size={20} color={Colors.textLight} />
            <AppText style={styles.timerText}>
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
              {currentQ.options.map((option, index) => (
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
            <AppText style={[styles.navButtonText, currentQuestion === 0 && styles.disabledText]}>Previous</AppText>
          </TouchableOpacity>

          {currentQuestion === questions.length - 1 ? (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <AppText style={styles.submitButtonText}>Submit Quiz</AppText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.navButton, currentQuestion === questions.length - 1 && styles.disabledButton]} 
              onPress={handleNext}
              disabled={currentQuestion === questions.length - 1}
            >
              <AppText style={[styles.navButtonText, currentQuestion === questions.length - 1 && styles.disabledText]}>Next</AppText>
              <ChevronRight size={20} color={currentQuestion === questions.length - 1 ? Colors.textLight : Colors.primary} />
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
});
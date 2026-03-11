"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Brain } from "@phosphor-icons/react";
import type { QuizQuestion } from "@/lib/data/quizzes";
import styles from "./TopicQuiz.module.css";

interface TopicQuizProps {
  questions: QuizQuestion[];
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export function TopicQuiz({ questions }: TopicQuizProps) {
  // Map of questionId -> selected option index
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (answers[questionId] !== undefined) return; // already answered
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] === q.correctIndex
  ).length;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        <span className={styles.headingIcon}>
          <Brain weight="duotone" />
        </span>
        Test Your Knowledge
      </h2>

      {questions.map((q, qi) => {
        const selectedIndex = answers[q.id];
        const isAnswered = selectedIndex !== undefined;

        return (
          <div key={q.id} className={styles.questionCard}>
            <div className={styles.questionNumber}>
              Question {qi + 1} of {questions.length}
            </div>
            <div className={styles.questionText}>{q.question}</div>

            <ul className={styles.optionsList}>
              {q.options.map((option, oi) => {
                const isSelected = selectedIndex === oi;
                const isCorrectOption = oi === q.correctIndex;

                let stateClass = "";
                if (isAnswered) {
                  if (isSelected && isCorrectOption) {
                    stateClass = styles.correct;
                  } else if (isSelected && !isCorrectOption) {
                    stateClass = styles.wrong;
                  } else if (isCorrectOption) {
                    stateClass = styles.correct;
                  } else {
                    stateClass = styles.dimmed;
                  }
                }

                return (
                  <li key={oi}>
                    <button
                      type="button"
                      className={`${styles.option} ${stateClass}`}
                      disabled={isAnswered}
                      onClick={() => handleSelect(q.id, oi)}
                    >
                      <span className={styles.optionLabel}>
                        {OPTION_LETTERS[oi]}
                      </span>
                      <span>{option}</span>
                      {isAnswered && isSelected && isCorrectOption && (
                        <span className={styles.resultIconCorrect}>
                          <CheckCircle weight="fill" />
                        </span>
                      )}
                      {isAnswered && isSelected && !isCorrectOption && (
                        <span className={styles.resultIconWrong}>
                          <XCircle weight="fill" />
                        </span>
                      )}
                      {isAnswered && !isSelected && isCorrectOption && (
                        <span className={styles.resultIconCorrect}>
                          <CheckCircle weight="fill" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {isAnswered && (
              <div className={styles.explanation}>
                <p className={styles.explanationText}>{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      <div className={styles.scoreBar}>
        <span className={styles.scoreIcon}>
          <CheckCircle weight="fill" />
        </span>
        <span className={styles.scoreText}>
          <span
            className={`${styles.scoreValue} ${
              answeredCount === questions.length &&
              correctCount === questions.length
                ? styles.scorePerfect
                : ""
            }`}
          >
            {correctCount}/{questions.length}
          </span>{" "}
          correct
          {answeredCount < questions.length && (
            <>
              {" "}
              &middot;{" "}
              {questions.length - answeredCount} remaining
            </>
          )}
        </span>
      </div>
    </section>
  );
}

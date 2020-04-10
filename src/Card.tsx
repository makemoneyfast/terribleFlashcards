import * as React from "react";
import * as ReactDom from "react-dom";

import { connect } from "react-redux";
import { Dispatch, Action } from "redux";

import { State, eCardState, eQuizMode } from "./common";

import { flipCard } from "./redux/quizDuck";
import RetestButton from "./RetestButton";

import * as _ from "Lodash";

import "./styles/card.less";

interface CardProps {
    currentSetName: string;
    currentTagName: string;
    cardNumber: number;
    totalCards: number;
    numberOfCardsToRetest: number;
    retesting: boolean;

    character: string;
    tags: string[];
    hint: string;
    meaning: string;
    kunyomi: string;
    onyomi: string;

    retest: boolean;
    cardState: eCardState;
    quizType: eQuizMode;
    canFlip: boolean;
    onFlip: () => void;
}

const mapStateToProps: (state: State) => Partial<CardProps> = (
    state: State
) => {
    const currentSet = state.assets.sets[state.quiz.currentSetID];
    const currentTag = state.assets.tags[state.quiz.currentTagID];
    const currentCard =
        state.assets.kanji[state.quiz.currentQuiz[state.quiz.currentCardIndex]];
    return {
        currentSetName: currentSet ? currentSet.name : undefined,
        currentTagName: currentTag ? currentTag.id : undefined,
        cardNumber: state.quiz.currentCardIndex + 1,
        totalCards: state.quiz.currentQuiz.length,
        numberOfCardsToRetest: _(state.assets.kanji)
            .filter(kanji => kanji.retest)
            .value().length,
        retesting: state.quiz.retesting,
        character: currentCard.character,
        tags: currentCard.tags,
        hint: currentCard.notes,
        meaning: currentCard.meaning,
        kunyomi: currentCard.kunyomi,
        onyomi: currentCard.onyomi,

        retest: currentCard.retest,
        cardState: state.quiz.cardState,
        quizType: state.quiz.quizMode,
        canFlip: !(
            state.quiz.cardState === eCardState.answer &&
            state.quiz.currentCardIndex >= state.quiz.currentQuiz.length - 1
        )
    };
};

const mapDispatchToProps: (dispatch: Dispatch<Action>) => Partial<CardProps> = (
    dispatch: Dispatch<Action>
) => {
    return {
        onFlip: () => dispatch(flipCard())
    };
};

const BasicCard: React.StatelessComponent<CardProps> = (props: CardProps) => {
    let question: string;
    let hint: string;
    let answer: string;
    let questionLanguage: string;
    let vocabularyType: " character" | " compound";
    let answerLanguage: string;
    const kunyomi: string = props.kunyomi;
    let onyomi: string = props.onyomi;

    switch (props.quizType) {
        case eQuizMode.character:
            question = props.character;
            hint = props.hint;
            answer = props.meaning;
            questionLanguage = " japanese";
            vocabularyType =
                props.character.length === 1 ? " character" : " compound";
            answerLanguage = " english";
            break;
        case eQuizMode.meaning:
            question = props.kunyomi || props.onyomi;
            hint = props.meaning;
            answer = props.character;
            questionLanguage = " japanese";
            vocabularyType = " compound";
            answerLanguage = " japanese";
            break;
        case eQuizMode.reading:
            question = props.character;
            hint = props.meaning;
            answer = props.onyomi || props.kunyomi;
            questionLanguage = " japanese";
            vocabularyType =
                props.character.length === 1 ? " character" : " compound";
            answerLanguage = " japanese";
            break;
    }

    const cardSelectStyle = {
        border: "#00C 1px solid",
        padding: "5px"
    };

    const flipHandler = props.canFlip ? props.onFlip : () => undefined;

    let statusMessage;

    if (props.currentSetName !== undefined) {
        if (props.numberOfCardsToRetest > 0) {
            statusMessage = (
                <div>
                    {props.retesting ? "Retesting" : "Testing"} set{" "}
                    <strong>{props.currentSetName}</strong>; card{" "}
                    <strong>{props.cardNumber}</strong> of{" "}
                    <strong>{props.totalCards}</strong>;{" "}
                    <strong>{props.numberOfCardsToRetest}</strong> to retest
                </div>
            );
        } else {
            statusMessage = (
                <div>
                    {props.retesting ? "Retesting" : "Testing"} set{" "}
                    <strong>{props.currentSetName}</strong>; card{" "}
                    <strong>{props.cardNumber}</strong> of{" "}
                    <strong>{props.totalCards}</strong>
                </div>
            );
        }
    } else {
        if (props.numberOfCardsToRetest > 0) {
            statusMessage = (
                <div>
                    {props.retesting ? "Retesting" : "Testing"} tag{" "}
                    <strong>{props.currentTagName}</strong>; card{" "}
                    <strong>{props.cardNumber}</strong> of{" "}
                    <strong>{props.totalCards}</strong>;{" "}
                    <strong>{props.numberOfCardsToRetest}</strong> to retest
                </div>
            );
        } else {
            statusMessage = (
                <div>
                    {props.retesting ? "Retesting" : "Testing"} tag{" "}
                    <strong>{props.currentTagName}</strong>; card{" "}
                    <strong>{props.cardNumber}</strong> of{" "}
                    <strong>{props.totalCards}</strong>
                </div>
            );
        }
    }

    switch (props.cardState) {
        case eCardState.question:
            return (
                <div
                    className={
                        props.retest
                            ? "card question-mode retest"
                            : "card question-mode"
                    }
                    onClick={flipHandler}>
                    <div className="content">
                        <div className="status">{statusMessage}</div>
                        <div className="question">
                            <div
                                className={
                                    "content" +
                                    questionLanguage +
                                    vocabularyType
                                }>
                                {question}
                            </div>
                        </div>
                        <RetestButton />
                    </div>
                </div>
            );
        case eCardState.hint:
            return (
                <div
                    className={
                        props.retest
                            ? "card hint-mode retest"
                            : "card hint-mode"
                    }
                    onClick={flipHandler}>
                    <div className="content">
                        <div className="status">{statusMessage}</div>
                        <div className="question">
                            <div
                                className={
                                    "content" +
                                    questionLanguage +
                                    vocabularyType
                                }>
                                {question}
                            </div>
                        </div>
                        <div className="answer">
                            <div className="hint">
                                <div className="content english">{hint}</div>
                            </div>
                        </div>
                        <RetestButton />
                    </div>
                </div>
            );
        case eCardState.answer:
            const tags = [];
            for (let tag of props.tags) {
                tags.push(
                    <div className="tag" key={tag} id={tag}>
                        {tag}
                    </div>
                );
            }
            return (
                <div
                    className={
                        props.retest
                            ? "card answer-mode retest"
                            : "card answer-mode"
                    }
                    onClick={flipHandler}>
                    <div className="content">
                        <div className="status">{statusMessage}</div>
                        <div className="question">
                            <div
                                className={
                                    "content" +
                                    questionLanguage +
                                    vocabularyType
                                }>
                                {question}
                            </div>
                        </div>
                        <div className="answer">
                            <div className="hint">
                                <div className="content english">{hint}</div>
                            </div>
                            <div className="meaning">
                                <div className={"content" + answerLanguage}>
                                    {answer}
                                </div>
                            </div>
                            <div className="kunyomi">
                                <div className={"content" + answerLanguage}>
                                    {kunyomi}
                                </div>
                            </div>
                            <div className="onyomi">
                                <div className={"content" + answerLanguage}>
                                    {onyomi}
                                </div>
                            </div>
                        </div>
                        <div className="tags">{tags}</div>
                        <RetestButton />
                    </div>
                </div>
            );
    }
    return <div />;
};

const Card = connect(
    mapStateToProps,
    mapDispatchToProps
)(BasicCard);

export default Card;

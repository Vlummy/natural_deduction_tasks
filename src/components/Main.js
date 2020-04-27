import React, { Component } from 'react';

/**
 * Component for learning Natural Deduction.
 * 
 * This component is only for demonstration purposes of the prototype. This means that there has not been any testing involved.
 * All the functions should be considered to be refactored decoupled. 
 */
class Main extends Component {
  constructor(props) {
    super()
    this.state = {
      // Indicates which task the user is on. Is used as index to allTasks.
      taskCounter: 0,

      // All tasks that has been created for this learning module
      allTasks: [
        {
          premise: "p & q => q & p",
          step1: { derived: "p & q", rule: "assume", fromLines: [0], match: undefined },
          step2: { derived: "q", rule: "ANDe2", fromLines: [1], match: undefined },
          step3: { derived: "p", rule: "ANDe1", fromLines: [1], match: undefined },
          step4: { derived: "q & p", rule: "ANDi", fromLines: [2, 3], match: undefined },
          step5: { derived: "p & q => q & p", rule: "=>i", fromLines: [1, 4], match: undefined }
        },
        {
          entailment: "p => q |- p & r => q & r",
          premise: "p => q",
          step1: { derived: "p & r", rule: "assume", fromLines: [0], match: undefined },
          step2: { derived: "p", rule: "ANDe1", fromLines: [2], match: undefined },
          step3: { derived: "r", rule: "ANDe2", fromLines: [2], match: undefined },
          step4: { derived: "q", rule: "=>e", fromLines: [1, 3], match: undefined },
          step5: { derived: "q & r", rule: "ANDi", fromLines: [5, 4], match: undefined },
          step6: { derived: "p & r => q & r", rule: "=>i", fromLines: [2, 6], match: undefined }

        }
      ],

      // This state variable is updated to a new task each time a user navigates between tasks.
      // The task below is the initial task.
      logicTask: {
        premise: "p & q => q & p",
        step1: { derived: "p & q", rule: "assume", fromLines: [0], match: undefined },
        step2: { derived: "q", rule: "ANDe2", fromLines: [1], match: undefined },
        step3: { derived: "p", rule: "ANDe1", fromLines: [1], match: undefined },
        step4: { derived: "q & p", rule: "ANDi", fromLines: [2, 3], match: undefined },
        step5: { derived: "p & q => q & p", rule: "=>i", fromLines: [1, 4], match: undefined }
      },

      // State variable for all the rules that can be used in the learning module.
      // They have to follow the same formatting as below to be interpret by the program.
      // The conversion of the rules is executed by a simple transpiler function.
      rules: {
        andIntro: 'ANDi',
        andEli1: 'ANDe1',
        andEli2: 'ANDe2',
        orIntro1: 'ORi1',
        orIntro2: 'ORi2',
        doubleNegi: 'notNoti',
        doubleNege: 'notNote',
        eliImpli: '=>e',
        modusTollens: 'MT',
        implIntro: '=>i',
        assume: "assume"
      },

      // This variable indiactes which step the user us working/solving in one task.
      // step1: currentStep is 1
      // step2: currentStep is 2
      // ...
      currentStep: 1,

      // Calculates the points a user has. If they select wrong answer, p - 1, else p + 1.
      points: 0
    }
  }

  /**
   * Sets "on hover" for tags with .premise class.
   */
  componentDidMount() {
    var premise = document.querySelector('.premise');

    premise.addEventListener('mouseover', this.setPhiPsi);
    premise.addEventListener('mouseout', this.resetPhiPsi);
  }

  /**
   * Loads the next task when user clicks button "View Next Task".
   */
  nextTask = () => {
    const { taskCounter, allTasks } = this.state;

    let incrementTask = taskCounter + 1;
    let nextTask = undefined;
    if (allTasks[incrementTask]) nextTask = allTasks[incrementTask];

    if (!nextTask) return;

    this.setState({
      logicTask: nextTask,
      taskCounter: incrementTask,
      currentStep: 1,
      points: 0
    })
  }

  /**
   * Loads the previous task when user clicks button "Previous Task".
   */
  previousTask = () => {
    const { taskCounter, allTasks } = this.state;

    let decrementTask = taskCounter - 1;
    let previousTask = undefined;
    if (allTasks[decrementTask]) previousTask = allTasks[decrementTask];

    if (!previousTask) return;

    this.setState({
      logicTask: previousTask,
      taskCounter: decrementTask,
      currentStep: 1,
      points: 0
    })

  }

  /**
   * When user hover over premises, P and Q will be replaced with Phi ans Psi to * demonstrate the meaning. 
   */
  setPhiPsi = (e) => {
    const { logicTask } = this.state;

    const newPremise = logicTask['premise'].split('p').join('Φ').split('q').join('ψ');

    logicTask['premise'] = newPremise;

    this.setState({
      logicTask: logicTask
    })
  }

  /**
   * When user exists hover on premises, Phi and Psi will return to P and Q.
   */
  resetPhiPsi = (e) => {
    const { logicTask } = this.state;

    const newPremise = logicTask['premise'].split('Φ').join('p').split('ψ').join('q');

    logicTask['premise'] = newPremise;

    this.setState({
      logicTask: logicTask
    })
  }

  /**
   * A user must explain from which line/s they derived the knowledge of applying a rule. It is not enough to only select or guess a rule, one must be able to explain why one choose a rule. 
   * 
   * This functions give the user a prompt to enter what lines they are deriving a rule from. If the line-numbers are incorrect, they must try again.
   * 
   * This function makes sure the user is not only guessing, but understands.
   * 
   * The provided line numbers is being compared with the state data in:
   *    LogicTask.stepX.fromLines.
   * 
   * This function is a sub-function of matchRule()
   */
  matchRuleAndLine = (logicTask, key, rule, message) => {
    // line numbers provided by user
    const lines = prompt(`Which line/s are you applying the ${rule} rule on?`, message).match(/\d+/g);

    // We assume the user to be correct, and let the algorithm prove it.
    var wrongLineFound = false;

    // Check if the line numbers provided is included in fromLines array.
    for (var i = 0; i < lines.length; i++) {
      if (!logicTask[key]['fromLines'].includes(parseInt(lines[i]))) {
        wrongLineFound = true;
      }
    }

    // If wrongLineFound is true, return false, else true.
    return wrongLineFound ? false : true;
  }

  /**
   * When a user selects a rule, the selected rule if matched with the answer provided in the LogicTask variable. If there is a match, then matchRuleAndLine will be executed. If this also is correct, the user has managed to complete one step on the unfolded deduction.
   */
  matchRule = (e) => {
    const { currentStep, logicTask, points } = this.state;
    const key = "step" + currentStep;

    // If there is a match between selected rule and actual rule
    if (logicTask[key]['rule'] === e.target.name) {
      // True xor False depending on user provided line numbers.
      var hasMatch = this.matchRuleAndLine(logicTask, key, e.target.name, "Enter one or more comma separated line numbers. Example: 1,3");
      
      if (hasMatch) { // Correct line numbers
        logicTask[key]['match'] = e.target.name;
        const incrementStep = currentStep + 1;
        const incrementPoint = points + 1;
        this.solvedNotifier(logicTask, incrementStep, incrementPoint);
        alert(this.explainRule(e.target.name));
        this.setState({ logicTask: logicTask, currentStep: incrementStep, points: incrementPoint })
      } else { // Not correct line numbers
        this.wrongAnswerNotifier(points, `You selected the rule "${e.target.name}". This is correct, but you need to specify what line/s you are using this rule on. It has to be a line before line ${currentStep}. Try again.`);
      }
    } else { // If there is not a match between selected rule and actual rule.
      this.wrongAnswerNotifier(points, "Not Correct Rule.\n\n" + this.explainRule(e.target.name));
    }
  }

  /**
   * This function provides knowledge about the different rules and how to use them.
   * It returns a description based on rule input.
   */
  explainRule = (rule) => {
    switch (rule) {
      case "assume":
        return "Assumption:\n\n We can start a proof by assuming that some part of it is true, and then use deduction to prove or disprove it. We usually create an assumption box to prove the assumption before we continue proving the rest of the premise."
      case "ANDi":
        return "AND Introduction:\n\n To prove Φ Λ ψ, you must first prove Φ and ψ separately and then use the rule Λi."
      case "ANDe1":
        return "AND Elimination 1:\n\n You are eliminating Λ ψ from Φ Λ ψ. You now have Φ in the next step."
      case "ANDe2":
        return "AND Elimination 2:\n\n You are eliminating Φ Λ from Φ Λ ψ. You now have ψ in the next step."
      case "ORi1":
        return "OR Introduction 1:\n\n If you have Φ, then you can use Vi1 to create Φ V ψ. This is because if Φ is true, then Φ V ψ is also true."
      case "ORi2":
        return "OR Introduction 2:\n\n If you have ψ, then you can use Vi2 to create Φ V ψ. This is because if ψ is true, then Φ V ψ is also true."
      case "notNoti":
        return "Not Not Introduction:\n\n If you have Φ, you can apply the rule ¬¬i to get ¬¬Φ."
      case "notNote":
        return "Not Not Elimination:\n\n If you have ¬¬Φ, you can apply the rule ¬¬e to get Φ."
      case "=>e":
        return "Implication Elimination:\n\n If you have Φ and Φ ⇒ ψ, then you can get ψ by eliminating the implication."
      case "=>i":
        return "Implication Introduction:\n\n From all Φ ... ψ steps before the step you are on, you can introduce an implication."
      case "MT":
        return "Modus Tollens:\n\n If you have Φ ⇒ ψ and ¬ψ, you can get ¬Φ. This is becuase if Φ ⇒ ψ but ψ is false, then Φ must also be false."
      case "ORe":
        return "OR Elimination:\n\n If you have Φ V ψ, and you want to prove some X, then try to prove X from Φ and from ψ in turn."
    }
  }

  /**
   * This function converts a rule from its prescribed form to corresponding symbol.
   * This helps user's get familiar with the symbols and syntax of logic.
   */
  ruleTranspiler = (rule) => {
    switch (rule) {
      case "assume":
        return "Assumption"
      case "ANDi":
        return "Λi"
      case "ANDe1":
        return "Λe1"
      case "ANDe2":
        return "Λe2"
      case "ORi1":
        return "Vi1"
      case "ORi2":
        return "Vi2"
      case "notNoti":
        return "¬¬i"
      case "notNote":
        return "¬¬e"
      case "=>e":
        return "⇒e"
      case "=>i":
        return "⇒i"
      case "MT":
        return "MT"
      case "ORe":
        return "Ve"
    }
    return rule;
  }

  /**
   * This function take an prescribed operator string and returns the approriate symbol. This helps user's get familiar with the symbols and syntax of logic.
   */
  operatorTranspiler = (operator) => {
    switch (operator) {
      case "&":
        return "Λ"
      case "and":
        return "Λ"
      case "or":
        return "V"
      case "=>":
        return "⇒"
      case "not":
        return "¬"
      case "notNot":
        return "¬¬"
      case "|-":
        return "Ͱ"
    }
    return operator.toUpperCase();
  }

  /**
   * Thgis function takes a sentence from the prescribes tasks and returns a new sentence that looks more like how we actually write logical statements. This function depends on operatorTranspiler.
   * This helps user's get familiar with the symbols and syntax of logic.
   */
  sentenceTransformer = (sentence) => {
    sentence = sentence.toString().split(' ');
    let newSentence = "";

    for (var i = 0; i < sentence.length; i++) {
      newSentence += " " + this.operatorTranspiler(sentence[i]);
    }

    return newSentence;
  }

  /**
   * This function is executed when a task has been completed.
   */
  solvedNotifier = (logicTask, step, points) => {
    const nextStep = "step" + step;
    if (!logicTask[nextStep]) alert("Very Good! You have prooved " + logicTask['premise'] + " by using natural deduction. Your got the score: " + points);
  }

  /**
   * This function is executed when a user gives wrong answer.
   * It takes in a message as parameter which can be used to demonstrate what the user did wrong at different steps in the process of solving tasks.
   */
  wrongAnswerNotifier = (currentPoints, message) => {
    const decrementPoint = currentPoints - 1;
    this.setState({ points: decrementPoint });
    alert(message);
  }

  /**
   * Utility function for coloring finished steps with green, and current steps as orange.
   */
  stepIndicator = (currentStep, index) => {
    const { logicTask } = this.state;
    if (logicTask['entailment']) currentStep++;
    if (currentStep === index) return "orange";
    if (currentStep > index) return "green";
    return "black";
  }

  /**
   * This function renders the html elements and updates when component state updates.
   * 
   * This is only a prototype, therefore css styling is written inline. 
   */
  render() {
    const { logicTask, rules, points, currentStep } = this.state;
    return (
      <div style={{ display: 'flex', flexDirection: "column", width: "500px", marginLeft: 'auto', marginRight: 'auto' }}>
        <h3>Learn Natural Deduction</h3>

        <div style={{ display: 'flex', marginLeft: 'auto', marginRight: 'auto' }}>

          <div style={{ display: 'flex', flexDirection: 'row', borderRight: '1px solid black', margin: "5px" }}>

            <div style={{ display: 'flex', flexDirection: 'column', margin: '10px', padding: "10px" }}>
              <h4>Deduction</h4>
              {Object.keys(logicTask).map((key, index) => {
                if (key === 'premise' || key === 'entailment') return <span className="premise" style={{ marginBottom: '10px', borderBottom: "1px solid black" }}>{index}. {this.sentenceTransformer(logicTask[key])}</span>
                return <span style={{ color: this.stepIndicator(currentStep, index) }}>{index}. {this.sentenceTransformer(logicTask[key]['derived'])}</span>
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', margin: '10px', padding: "10px" }}>
              <h4>Rule</h4>
              {Object.keys(logicTask).map((key, index) => {
                if (key === 'entailment') return <span style={{ marginBottom: '10px', borderBottom: "1px solid black" }}>Entailment</span>
                if (key === 'premise') return <span style={{ marginBottom: '10px', borderBottom: "1px solid black" }}>Premise</span>
                if (index > currentStep) return <span>---</span>
                return <span style={{ color: this.stepIndicator(currentStep, index) }}>{logicTask[key]['match'] ? this.ruleTranspiler(logicTask[key]['match']) : "Select Correct Rule"}</span>
              })}

            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', margin: '5px' }}>
            <h4>Rules</h4>
            {Object.keys(rules).map((key) => {
              return <input onClick={this.matchRule} type="button" name={rules[key]} value={this.ruleTranspiler(rules[key])} />
            })}
          </div>

        </div>
        <div style={{display: "flex", justifyContent: "space-around", marginTop: "10px"}}>
          <button onClick={this.previousTask}>Previous Task</button>
          <button onClick={this.nextTask}>View Next Task</button>
        </div>
        <span>Points: {points}</span>
      </div>
    );
  }
}

export default Main;
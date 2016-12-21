let possibleCombinationSum = (arr, n) => {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  let listSize = arr.length, combinationsCount = (1 << listSize)
  for (let i = 1; i < combinationsCount ; i++ ) {
    let combinationSum = 0;
    for (let j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

class StarsFrame extends React.Component {
  render() {

    let stars = [];
    for (let i=0; i<this.props.numberOfStars; i++) {
      stars.push(
        <span className="glyphicon glyphicon-star"></span>
      );
    }

    return (
      <div id="stars-frame">
        <div className="well">
          {stars}
        </div>
      </div>
    );
  }
}

class ButtonFrame extends React.Component {
  render() {
    let button, correct = this.props.correct;
    let disabled = (this.props.selectedNumbers.length === 0);

    switch (correct) {
      case true:
        button = (
          <button className="btn btn-success btn-lg"
                  onClick={this.props.acceptAnswer}>
            <span className="glyphicon glyphicon-ok"></span>
          </button>
        );
        break;
      case false:
        button = (
          <button className="btn btn-danger btn-lg">
            <span className="glyphicon glyphicon-remove"></span>
          </button>
        );
        break;
      default:
        disabled = (this.props.selectedNumbers.length === 0);
        button = (
          <button className="btn btn-primary btn-lg" disabled={disabled}
                  onClick={this.props.checkAnswer}>=</button>
        );
    }

    return (
      <div id="button-frame">
        {button}
        <br/><br/>
        <button className="btn btn-warning btn-xs" onClick={this.props.redraw}
                disabled={this.props.redraws === 0}>
          <span className="glyphicon glyphicon-refresh"></span>
          &nbsp;
          {this.props.redraws}
        </button>
      </div>
    );
  }
}

class AnswerFrame extends React.Component {
  render() {

    let selectedNumbers = this.props.selectedNumbers.map((i) => {
      return (
        <span onClick={this.props.unselectNumber.bind(null, i)}>
          {i}
        </span>
      )
    });

    return (
      <div id="answer-frame">
        <div className="well">
          {selectedNumbers}
        </div>
      </div>
    );
  }
}

class NumbersFrame extends React.Component {
  render() {

    let numbers = [], className,
      selectNumber = this.props.selectNumber,
      usedNumbers = this.props.usedNumbers,
      selectedNumbers = this.props.selectedNumbers;
    for (let i=1; i<=9; i++) {
      className = "number selected-" + (selectedNumbers.indexOf(i)>=0);
      className += " used-" + (usedNumbers.indexOf(i)>=0);
      numbers.push(
        <div className={className} onClick={selectNumber.bind(null, i)}>{i}</div>
      );
    }
    return (
      <div id="numbers-frame">
        <div className="well">
          {numbers}
        </div>
      </div>
    );
  }
}

class DoneFrame extends React.Component {
  render() {
    return (
      <div className="well text-center">
        <h2>{this.props.doneStatus}</h2>
        <button className="btn btn-default" onClick={this.props.resetGame}>Play again</button>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      numberOfStars: Math.floor(Math.random()*9) + 1,
      selectedNumbers: [],
      usedNumbers: [],
      redraws: 5,
      correct: null,
      doneStatus: null
    };

    this.selectNumber = this.selectNumber.bind(this);
    this.unselectNumber = this.unselectNumber.bind(this);
    this.checkAnswer = this.checkAnswer.bind(this);
    this.acceptAnswer = this.acceptAnswer.bind(this);
    this.redraw = this.redraw.bind(this);
    this.resetGame = this.resetGame.bind(this);
  }


/**
 * Using setState is the proper way, replaceState has been deprecated.
 * */
  resetGame() {
    this.setState({
      numberOfStars: Math.floor(Math.random()*9) + 1,
      selectedNumbers: [],
      usedNumbers: [],
      redraws: 5,
      correct: null,
      doneStatus: null
    });
  }

  selectNumber(clickedNumber) {
    if (this.state.selectedNumbers.indexOf(clickedNumber) < 0) {
      this.setState(
        {selectedNumbers: this.state.selectedNumbers.concat(clickedNumber),
         correct: null}
      );
    }
  }

  unselectNumber(clickedNumber) {
    let selectedNumbers = this.state.selectedNumbers,
        indexOfNumber = selectedNumbers.indexOf(clickedNumber);

    selectedNumbers.splice(indexOfNumber, 1);
    this.setState(
      {selectedNumbers: selectedNumbers,
       correct: null}
    );
  }

  sumOfSelectedNumbers() {
    return this.state.selectedNumbers.reduce((p,n) => {
      return p+n;
    }, 0);
  }

  checkAnswer() {
    let correct = (this.state.numberOfStars === this.sumOfSelectedNumbers());
    this.setState( {correct: correct} );
  }

  acceptAnswer() {
    let usedNumbers = this.state.usedNumbers.concat(this.state.selectedNumbers);
    this.setState({
      selectedNumbers: [],
      usedNumbers: usedNumbers,
      correct: null,
      numberOfStars: Math.floor(Math.random()*9) + 1
    },
      () => {
        this.updateDoneStatus();
      }
    );
  }

  redraw() {
    if (this.state.redraws > 0) {
      this.setState({
        numberOfStars: Math.floor(Math.random() * 9) + 1,
        correct: null,
        selectedNumbers: [],
        redraws: this.state.redraws - 1
      },
        () => {
          this.updateDoneStatus();
        }
      );
    }
  }

  possibleSolutions() {
    let numberOfStars = this.state.numberOfStars,
        possibleNumbers = [],
        usedNumbers = this.state.usedNumbers;

    for (let i=1; i<=9;i++) {
      if (usedNumbers.indexOf(i) < 0) {
        possibleNumbers.push(i);
      }
    }

    return possibleCombinationSum(possibleNumbers, numberOfStars);
  }

  updateDoneStatus() {
    if (this.state.usedNumbers.length === 9) {
      this.setState({ doneStatus: 'Done! You won!' });
      toastr.success('Congratulations!');
      return;
    }
    if (this.state.redraws === 0 && !this.possibleSolutions()) {
      this.setState({ doneStatus: 'Game Over!' });
      toastr.error('Oops! Try again.');
    }
  }

  render() {
    let selectedNumbers = this.state.selectedNumbers,
        usedNumbers = this.state.usedNumbers,
        numberOfStars = this.state.numberOfStars,
        redraws = this.state.redraws,
        correct = this.state.correct,
        doneStatus = this.state.doneStatus,
        bottomFrame;

    if (doneStatus) {
      bottomFrame = <DoneFrame doneStatus={doneStatus}
                               resetGame={this.resetGame} />;
    } else {
      bottomFrame = <NumbersFrame selectedNumbers={selectedNumbers}
                                  usedNumbers={usedNumbers}
                                  selectNumber={this.selectNumber} />
    }

    return (
      <div id="game">
        <h2>Play Nine</h2>
        <hr/>
        <div className="clearfix">
          <StarsFrame numberOfStars={this.state.numberOfStars} />
          <ButtonFrame selectedNumbers={this.state.selectedNumbers}
                       correct={correct}
                       redraws={redraws}
                       checkAnswer={this.checkAnswer}
                       acceptAnswer={this.acceptAnswer}
                       redraw={this.redraw} />
          <AnswerFrame selectedNumbers={this.state.selectedNumbers}
                       unselectNumber={this.unselectNumber} />
        </div>

        {bottomFrame}

      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById('container'));
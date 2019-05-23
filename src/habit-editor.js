import React, { Component } from "react";

class HabitEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.presetName !== undefined ? this.props.presetName : "",
            goal: this.props.presetGoal !== undefined ? this.props.presetGoal : "",
            nameValid: true,
            goalValid: true
        }
        this.clickSave = this.clickSave.bind(this);
        this.handleGoalChange = this.handleGoalChange.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
    }

    handleNameChange(event) {
        this.setState({ name: event.target.value });
    }

    handleGoalChange(event) {
        this.setState({ goal: event.target.value });
    }

    async clickSave() {
        this.setState({
            nameValid: true,
            goalValid: true
        });
        let name = this.state.name;
        if (name.length === 0 || typeof name !== "string") {
            this.setState({ nameValid: false })
            return;
        }
        let goal = Number(this.state.goal);
        if (!Number.isInteger(goal) || goal <= 0) {
            this.setState({ goalValid: false })
            return;
        }
        let newHabit = { name, goal }
        this.props.setHabit(newHabit);
    }

    render() {
        let nameClass = "form-control" + (this.state.nameValid ? "" : " is-invalid");
        let goalClass = "form-control" + (this.state.goalValid ? "" : " is-invalid");
        return (
            <div className="form-row">
                <div className="col-12">
                    <label htmlFor="habit-name" className="mb-0">Name</label>
                    <input id="habit-name" className={nameClass} onChange={this.handleNameChange} value={this.state.name} />
                    {!this.state.nameValid && (<div className="invalid-feedback">
                        Please provide a valid name.
              </div>)}
                    <label htmlFor="habit-goal" className="mb-0">Goal</label>
                    <input id="habit-goal" className={goalClass} min="0" type="number" onChange={this.handleGoalChange} value={this.state.goal} />
                    {!this.state.goalValid && (<div className="invalid-feedback">
                        Please provide a valid goal (positive integer).
              </div>)}
                    <div className="d-flex flex-row-reverse pt-2">
                        <button className="btn btn-primary" onClick={this.clickSave}>Save</button>
                        {this.props.displayDelete &&
                            <button className="btn btn-danger mr-2" onClick={this.props.deleteHabit}>Delete Habit</button>
                        }
                    </div>
                </div>
            </div>
        )
    }

}
export default HabitEditor;
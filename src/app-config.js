import React, { Component } from "react";

class AppConfig extends Component {
    constructor(props) {
        super(props);
        this.clearDatabase = this.clearDatabase.bind(this);
        let exportHabits = []
        for (let habitId in this.props.habits) {
            exportHabits.push(this.props.habits[habitId])
        }
        exportHabits = JSON.stringify(exportHabits, null, 2);
        exportHabits = new Blob([exportHabits], {type : 'application/json'});
        this.exportHabitsURL = URL.createObjectURL(exportHabits);
    }

    async clearDatabase() {
        let confirmDelete = window.confirm("Confirm delete the database content?");
        if (confirmDelete) {
            await this.props.database.clear("habits");
            this.props.clearHabit()
        }
    }
    componentWillUnmount(){
        URL.revokeObjectURL(this.exportHabitsURL);
    }
    render() {
        
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col">
                        <div className="btn btn-outline-danger btn-lg btn-block" onClick={this.clearDatabase}>Clear Database</div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <a className="btn btn-outline-primary btn-lg btn-block mt-2" download="habit.json" href={this.exportHabitsURL}>Export to Json</a>
                    </div>
                </div>
            </React.Fragment>
        )

    }
}
export default AppConfig;  
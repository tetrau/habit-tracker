import React, { Component } from "react";

class AppConfig extends Component {
    constructor(props) {
        super(props);
        this.clearDatabase = this.clearDatabase.bind(this);
    }

    async clearDatabase() {
        let confirmDelete = window.confirm("Confirm delete the database content?");
        if (confirmDelete) {
            await this.props.database.clear("habits");
            this.props.clearHabit()
        }
    }

    render() {
        let exportHabits = []
        for (let habitId in this.props.habits) {
            exportHabits.push(this.props.habits[habitId])
        }
        exportHabits = JSON.stringify(exportHabits, null, 2);
        return (
            <React.Fragment>
                <div className="row">
                    <div className="col">
                        <div className="btn btn-outline-danger btn-lg btn-block" onClick={this.clearDatabase}>Clear Database</div>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <a className="btn btn-outline-primary btn-lg btn-block mt-2" download="habit.json" href={'data:text/plain;charset=utf-8,' + encodeURIComponent(exportHabits)}>Export to Json</a>
                    </div>
                </div>
            </React.Fragment>
        )

    }
}
export default AppConfig;  
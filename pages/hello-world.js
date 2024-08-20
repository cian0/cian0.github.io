import { useState } from 'react';
import Layout from '../components/Layout';
import WorkoutTracker from '../components/WorkoutTracker';

export default function WorkoutTrackerPage() {
  const [workouts, setWorkouts] = useState([]);

  const addWorkout = (workout) => {
    setWorkouts([...workouts, workout]);
  };

  return (
    <Layout>
      <div className="retro-container">
        <div className="retro-post">
          <h1>Workout Tracker</h1>
          <WorkoutTracker workouts={workouts} addWorkout={addWorkout} />
        </div>
      </div>
    </Layout>
  );
}

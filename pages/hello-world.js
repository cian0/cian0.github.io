import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import WorkoutTracker from '../components/WorkoutTracker';

export default function WorkoutTrackerPage() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const storedWorkouts = localStorage.getItem('workouts');
    if (storedWorkouts) {
      setWorkouts(JSON.parse(storedWorkouts));
    }
  }, []);

  const addWorkout = (workout) => {
    const updatedWorkouts = [...workouts, workout];
    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
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

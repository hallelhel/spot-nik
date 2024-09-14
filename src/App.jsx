import { useState, useEffect } from "react";
import { Button, DatePicker, Space, Typography } from 'antd';
import { fetchBoardItems, fetchStatusLabels, filterBoardItemsByDate } from './api/mondayApi.jsx';
import TaskTable from './components/TaskTable.jsx';
import AddItemForm from './components/AddItemForm.jsx';

const { Title } = Typography;

function App() {
  const [tasks, setTasks] = useState([])
  const [labels, setLabels] = useState([]);
  const [boardName, setBoardName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterApplied, setFilterApplied] = useState(false);

  useEffect(() => {
    const getItems = async () => {
      try {
        const { boardName, orderedItems } = await fetchBoardItems();
        setBoardName(boardName);
        setTasks(orderedItems);
        const labels = await fetchStatusLabels();
        setLabels(labels);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false)
      }
    };
    getItems();
  }, []);
  const handleFilterToggle = async () => {
    try {
      if (filterApplied) {
        const {orderedItems} = await fetchBoardItems();
        setTasks(orderedItems);
        setFilterDate(null);
        setFilterApplied(false);
      } else {
        if (filterDate) {
          const formattedDate = filterDate.format('YYYY-MM-DD');
          const filteredTasks = await filterBoardItemsByDate(formattedDate);
          
          const mappedTasks = filteredTasks.map(task => {
            const text = task.column_values.find(col => col.id === 'text__1')?.text || '';
            const date = task.column_values.find(col => col.id === 'date4')?.text || '';
            const status = task.column_values.find(col => col.id === 'status')?.text || '';
            return {
              id: task.id,
              name: task.name,
              text: text,
              date: date,
              status: status
            };
          });

          setTasks(mappedTasks); 
          setFilterApplied(true);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  return (
    <div className="App">
       <Title level={1}>{boardName || "Loading Board Name..."}</Title>
       <div>
          <DatePicker
            format="YYYY-MM-DD"
            onChange={(date) => setFilterDate(date)}
            value={filterDate}
          />
          <Button
            type={filterApplied ? "default" : "primary"}
            onClick={handleFilterToggle}
            style={{ marginLeft: '10px' }}
          >
            {filterApplied ? 'Reset Filter' : 'Filter by Date'}
          </Button>
        </div>
       <TaskTable tasks={tasks} setTasks={setTasks} labels={labels}/>
       <AddItemForm labels={labels} setTasks={setTasks} />
    </div>
  )
}

export default App;
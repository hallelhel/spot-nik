import { useState, useEffect, useRef } from "react";
import { Select, DatePicker } from 'antd';
import { TextField, Button, Heading } from "monday-ui-react-core";
import TaskTable from './components/TaskTable.jsx';
import * as mondayApi from './api/mondayApi.jsx';
import * as fastApi from './api/fastApi.jsx';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'


const { Option } = Select;
const queryClient = new QueryClient()

function App() {
  const [tasks, setTasks] = useState([])
  const [labels, setLabels] = useState([]);
  const [labelsColors, setLabelsColors] = useState([]); 
  const [boardName, setBoardName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterApplied, setFilterApplied] = useState(false);
  const [selectedApi, setSelectedApi] = useState("monday");

  const columnMapCacheRef = useRef({});

  const apiMap = {
    monday: mondayApi,
    fastApi: fastApi
  };

  useEffect(() => {
    const { fetchBoardItems, fetchStatusLabels } = apiMap[selectedApi];
    const getItems = async () => {
      try {
        const { boardName, orderedItems, columnMapCache } = await fetchBoardItems();
        setBoardName(boardName);
        setTasks(orderedItems);
        columnMapCacheRef.current = columnMapCache || {};
        const labelsColors_ = await fetchStatusLabels();
        const labels_ = labelsColors_.map(item => item.label);
        
        setLabels(labels_);
        setLabelsColors(labelsColors_);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false)
      }
    };
    getItems();
  }, [selectedApi]);

  const handleFilterToggle = async () => {
    const { fetchBoardItems, filterBoardItemsByDate } = apiMap[selectedApi];
    try {
      if (filterApplied) {
        const {orderedItems, columnMapCache} = await fetchBoardItems();
        setTasks(orderedItems);
        columnMapCacheRef.current = columnMapCache || {};
        setFilterDate(null);
        setFilterApplied(false);
      } else {
        if (filterDate) {
          const formattedDate = filterDate.format('YYYY-MM-DD');
          const filteredTasks = await filterBoardItemsByDate(formattedDate);
          setTasks(filteredTasks); 
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
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <Heading type={Heading.types.H1} >{boardName || "Loading Board Name..."}</Heading>
        <Select
            defaultValue="monday"
            onChange={(value) => setSelectedApi(value)}
            style={{ marginBottom: "20px" }}
          >
            <Option value="monday">Monday API</Option>
            <Option value="fastApi">FastAPI</Option>
          </Select>

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
        <TaskTable tasks={tasks} setTasks={setTasks} labels={labels} labelsColors={labelsColors} selectedApi={apiMap[selectedApi]} />
      </div>
    </QueryClientProvider>
  )
}

export default App;
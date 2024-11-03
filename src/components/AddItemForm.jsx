import { useState, useEffect  } from 'react';
import { Button, TextField, Dropdown, TableRow, TableCell, Table } from "monday-ui-react-core";
import Label from "monday-ui-react-core/dist/Label"; 

function AddItemForm({ labels, setTasks, selectedApi }) {
  const [name, setName] = useState('');
  const [text, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState(labels[0] || '');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const { createBoardItem } = selectedApi;

  useEffect(() => {
    setIsButtonDisabled(name.trim() === '');
  }, [name]);
  const handleSubmit = async (e) => {
    const newItem = {
      name: name, 
      text: text,
      date: date,
      status: status,
    }
    try {
      const id = await createBoardItem (newItem);
      setTasks(prevTasks => [
        ...prevTasks, 
        { 
          id: id,         
          name: newItem.name, 
          text: newItem.text, 
          date: newItem.date, 
          status: newItem.status
        }
      ]);
      setName('');
      setDescription('');
      setDate('');
      setStatus(labels[0] || '');
    } catch (err) {
      console.error("Error adding task:", err);
      setTasks(prevTasks => prevTasks.filter(task => task.name !== newItem.name));
    }
  };
  return (
    <TableRow>
      <TableCell>
        <TextField
          value={name}
          onChange={setName}
          placeholder="Name"
        />
      </TableCell>
  
      <TableCell>
        <TextField
          value={text}
          onChange={setDescription}
          placeholder="Description"
        />
      </TableCell>

      <TableCell>
        <TextField
          type="date"
          value={date}
          onChange={setDate}
        />
      </TableCell>

      <TableCell>     
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {labels.map((option, index) => (
            <option
              key={`${option.label}-${index}`} 
              value={option.label}
            >
              {option.label || 'No Status'} 
            </option>
          ))}
        </select>
      </TableCell>

      <TableCell>
        <Button 
          kind="primary" 
          onClick={handleSubmit} 
          disabled={isButtonDisabled}
        >
          Add Task
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default AddItemForm;

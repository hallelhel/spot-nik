import { useState, useEffect  } from 'react';
import { createBoardItem } from '../api/mondayApi.jsx';
import { Button, Input , Form, Select} from 'antd';
const { Option } = Select;

function AddItemForm({ labels, setTasks }) {
  const [name, setName] = useState('');
  const [text, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState(labels[0] || '');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

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
      console.log(newItem.text)
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
    <Form layout="inline" onFinish={handleSubmit} initialValues={{ name, text, date, status }}>
      <Form.Item >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          />
      </Form.Item>
     
      <Form.Item>
        <Input
          value={text}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
      </Form.Item>

      <Form.Item>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Form.Item>

      <Form.Item>
        <Select
          value={status}
          onChange={(value) => setStatus(value)}
          placeholder="Select Status"
        >
          {labels.map((label) => (
            <Option key={label} value={label}>
              {label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" disabled={isButtonDisabled}>
          Add Task
        </Button>
      </Form.Item>
    </Form>

  );
}

export default AddItemForm;

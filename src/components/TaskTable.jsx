import React, { useState } from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { updateItem, deleteItem } from '../api/mondayApi.jsx'; 

const TaskTable = ({ tasks, setTasks, labels }) => {
  const [editTaskId, setEditTaskId] = useState(null);
  const [updatedTask, setUpdatedTask] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: ''
  });

  const handleEditClick = (task) => {
    setEditTaskId(task.id);
    setUpdatedTask({
      name: task.name,
      description: task.text,
      dueDate: task.date,
      status: task.status || labels[0]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    try {
      await updateItem(editTaskId, updatedTask);

      const updatedTasks = tasks.map((t) =>
        t.id === editTaskId ? { 
          ...t, 
          name: updatedTask.name,
          text: updatedTask.description,
          date: updatedTask.dueDate, 
          status: updatedTask.status 
        } : t
      );
      setTasks(updatedTasks);
      
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setEditTaskId(null);
    }
  };
  const handleCancelClick = () => {
    setEditTaskId(null);
    setUpdatedTask({
      name: '',
      description: '',
      dueDate: '',
      status: ''
    });
  };

  const handleDeleteClick = async (taskId) => {
    try {
      await deleteItem(taskId);
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getTagColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'default';
      case 'In Progress':
        return 'blue';
      case 'Completed':
        return 'green';
      case 'On Hold':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) =>
        editTaskId === record.id ? (
          <input
            type="text"
            name="name"
            value={updatedTask.name}
            onChange={handleInputChange}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Description',
      dataIndex: 'text',
      key: 'description',
      render: (text, record) =>
        editTaskId === record.id ? (
          <input
            type="text"
            name="description"
            value={updatedTask.description}
            onChange={handleInputChange}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Due Date',
      dataIndex: 'date',
      key: 'due_date',
      render: (text, record) =>
        editTaskId === record.id ? (
          <input
            type="date"
            name="dueDate"
            value={updatedTask.dueDate}
            onChange={handleInputChange}
          />
        ) : (
          text
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) =>
        editTaskId === record.id ? (
          <select
            name="status"
            value={updatedTask.status}
            onChange={handleInputChange}
          >
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        ) : (
          <Tag color={getTagColor(status)}>{status}</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) =>
        editTaskId === record.id ? (
        <Space size="middle">
          <Button onClick={handleSaveClick}>Save</Button>
          <Button onClick={handleCancelClick} icon={<CloseOutlined />} />
        </Space>
        ) : (
          <Space size="middle">
            <Button onClick={() => handleEditClick(record)}>Edit</Button>
            <Button danger onClick={() => handleDeleteClick(record.id)}>Delete</Button>
          </Space>
        ),
    },
  ];

  return (
    <Table
      dataSource={tasks}
      columns={columns}
      rowKey="id"
      pagination={false}
    />
  );
};

export default TaskTable;


import React, { useState, useCallback, useMemo } from 'react';
import { Tag, Space } from 'antd';
import {Button, Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, Label, TextField, Dropdown} from "monday-ui-react-core";
import { CloseOutlined } from '@ant-design/icons';
import AddItemForm from './AddItemForm.jsx';

const TaskTable = ({ tasks, setTasks, labels, labelsColors, selectedApi}) => {
  const [editTaskId, setEditTaskId] = useState(null);
  const [updatedTask, setUpdatedTask] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: ''
  });
  
  const { updateItem, deleteItem } = selectedApi;

  const handleEditClick = (task) => {
    setEditTaskId(task.id);
    setUpdatedTask({
      name: task.name,
      description: task.text,
      dueDate: task.date,
      status: task.status || labels[0]
    });
  };

  const handleInputChange = (valueOrEvent, event) => {
    let name, value;
  
    if (event) {
      name = event.target.name;
      value = valueOrEvent;
    } else {
      name = valueOrEvent.target.name;
      value = valueOrEvent.target.value;
    }
  
    setUpdatedTask(prev => ({
      ...prev,
      [name]: value,
    }));
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
    const labelObject = labelsColors.find(label => label.label === status);
    return labelObject ? labelObject.color.color : 'default'; 
  };

  const getStatusStyle = (label) => {
    const colorObject = labelsColors.find(option => option.label === label);
    return {
      backgroundColor: colorObject?.color?.color || "default",
      color: "#fff",
      padding: "4px 8px",
      borderRadius: "4px",
    };
  };


  const columns = [
    {
      id: 'name',
      title: 'Name',
      loadingStateType: 'medium-text',
      render: (record) =>
        editTaskId === record.id ? (
          <TextField
            type="text"
            name="name"
            value={updatedTask.name}
            onChange={handleInputChange}
          />
        ) : (
          record.name
        ),
    },
    {
      id: 'description',
      title: 'Description',
      loadingStateType: 'long-text',
      render: (record) =>
        editTaskId === record.id ? (
          <TextField
            type="text"
            name="description"
            value={updatedTask.description}
            onChange={handleInputChange}
          />
        ) : (
          record.text
        ),
    },
    {
      id: 'dueDate',
      title: 'Due Date',
      loadingStateType: 'medium-text',
      render: (record) =>
        editTaskId === record.id ? (
          <TextField
            type="date"
            name="dueDate"
            value={updatedTask.dueDate}
            onChange={handleInputChange}
          />
        ) : (
          record.date
        ),
    },
    {
      id: 'status',
      title: 'Status',
      loadingStateType: 'medium-text',
      render: (record) =>
        editTaskId === record.id ? (
          <select
          name="status"
          value={updatedTask.status}
          onChange={handleInputChange}
          style={getStatusStyle(updatedTask.status)}
        >
          {labelsColors.map((option, index) => (
            <option
              key={`${option.label}-${index}`} 
              value={option.label}
              style={getStatusStyle(option.label)}
            >
              {option.label || 'No Status'} 
            </option>
          ))}
        </select>
      ) : (
        <Tag color={getTagColor(record.status || '')}>
          {record.status || 'No Status'}
        </Tag>  ),
      },
      
    {
      id: 'actions',
      title: 'Actions',
      loadingStateType: 'medium-text',
      render: (record) =>
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
      pagination={false}>
      <TableHeader>
        {columns.map((column) => (
          <TableHeaderCell key={column.id} title={column.title} />
        ))}
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            {columns.map((column) => (
              <TableCell key={column.id}>{column.render(task)}</TableCell>
            ))}
          </TableRow>
        ))}
        <AddItemForm labels={labelsColors} setTasks={setTasks} selectedApi={selectedApi}/>
      </TableBody>
      </Table>
  );
};

export default TaskTable;


const API_URL = 'http://localhost:8000';

const formatTaskFields = (task) => ({
  id: task._id,
  name: task.name,
  text: task.description,
  date: task.dueDate,
  status: task.status,
});

function convertFastApiLabels(fastApiLabels) {
  const colorMappings = {
      "Pending": { color: "#fdab3d", border: "#e99729", var_name: "orange" },
      "In Progress": { color: "#ffcc00", border: "#d4a50f", var_name: "yellow" },
      "Completed": { color: "#00c875", border: "#00b461", var_name: "green-shadow" },
      "": { color: "#c4c4c4", border: "#b0b0b0", var_name: "grey" } 
  };

  return fastApiLabels.map(label => ({
      label: label,
      color: colorMappings[label] || colorMappings[""], 
  }));
}

export const fetchBoardItems = async () => {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const orderedItems = data.tasks.map(formatTaskFields);
    return { boardName: 'Tasks', orderedItems }; 
    
  } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
};


export const createBoardItem = async ({ name, text, date, status }) => {
  const task = {
    name,
    description: text,
    dueDate: date,
    status: status.label,
  };

  try {
    const response = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    return result.task_id; 
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};


export const fetchStatusLabels = async () => {
  try {
    const response = await fetch(`${API_URL}/tasks/labels`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const result = convertFastApiLabels(data.labels)
    return result; 
  } catch (error) {
    console.error('Error fetching status labels:', error);
    throw error;
  }
};

export const updateItem = async (itemId, columnVals) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(columnVals),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    return formatTaskFields(result);
  } catch (error) {
    console.error('Error updating item:', error, itemId, columnVals );
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  try {
    const response = await fetch(`${API_URL}/tasks/${itemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};


export const filterBoardItemsByDate = async (date) => {
  try {
    const response = await fetch(`${API_URL}/tasks/by-date/?date=${date}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const result = data.tasks.map(formatTaskFields)
    return result;
    
  } catch (error) {
    console.error('Error filtering tasks by date:', error);
    throw error;
  }
};

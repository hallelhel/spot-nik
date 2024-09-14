const API_URL = 'https://api.monday.com/v2';
const API_KEY = import.meta.env.VITE_API_KEY;
const BOARD_ID = import.meta.env.VITE_BOARD_ID;

// Function to fetch board items
export const fetchBoardItems = async () => {
    const query =  `{boards(ids: ${BOARD_ID}) { name id description items_page { items { id name column_values{id type text } } } } }`;
  
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'API-Version': '2023-04',
        },
        body: JSON.stringify({ query }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const boardName = data.data.boards[0].name;
      const items = data.data.boards[0].items_page.items;
      
      const orderedItems = items.map(item => {
        const text = item.column_values.find(col => col.id === 'text__1')?.text || '';
        const date = item.column_values.find(col => col.id === 'date4')?.text || '';
        const status = item.column_values.find(col => col.id === 'status')?.text || '';
      
        return {
          name: item.name,
          id : item.id,
          text: text,
          date: date,
          status: status,
        };
      });
      
      return { boardName, orderedItems };
  
    } catch (error) {
      console.error('Error fetching board items:', error);
      throw error;
    }
  };

export const createBoardItem = async ({ name, text, date, status }) => {
  console.log(name, text, date, status)
  const query = `mutation ($myItemName: String!, $columnVals: JSON!) 
  { create_item (board_id:${BOARD_ID}, item_name:$myItemName, column_values:$columnVals) { id } }`;
  const vars = {
    "myItemName" : name,
    "columnVals" : JSON.stringify({
      "text__1": text,
      "status" : status,
      "date4" : date
    })
  };
  try {
    const response = await fetch("https://api.monday.com/v2", {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${API_KEY}`,

    },
    body: JSON.stringify({
      'query' : query,
      'variables' : JSON.stringify(vars)
    })
  })
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
  return result.data.create_item.id; // Return the newly created item ID
  } catch (error) {
      console.error('Error creating board item:', error);
      throw error;
  }
}

export const fetchStatusLabels = async() => {
  const query = `query {
    boards(ids: ${BOARD_ID}) { 
      columns {
        id
        title
        settings_str
      }
    }
  }`
  try {
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": API_KEY, 
      },
      body: JSON.stringify({
        query,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const statusColumn = data.data.boards[0].columns.find(col => col.id === 'status');
    if (statusColumn) {
      const settings = JSON.parse(statusColumn.settings_str);
      const labelsArray = Object.values(settings.labels);
      return labelsArray || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching status labels:', error);
    throw error;
  }
};

export const updateItem = async (itemId, columnVals) => {
  console.log(JSON.stringify({
    text__1: columnVals.description, 
    date4: columnVals.dueDate,       
    status: { label: columnVals.status }
  }))
  const query = `
    mutation ($itemId: ID!, $columnValues: JSON!) {
      change_multiple_column_values( item_id: $itemId, board_id:${BOARD_ID} , column_values: $columnValues) { id }} `;
  const vars = {
    itemId: itemId,
    boardId: BOARD_ID,
    columnValues: JSON.stringify({
      text__1: columnVals.description, 
      date4: columnVals.dueDate,       
      status: { label: columnVals.status }
    })
  }

  try {
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        variables: vars,
      }),
    });

    // Parse the response
    const data = await response.json();

    // Check for errors in the response
    if (data.errors) {
      throw new Error(`Error updating item: ${data.errors[0].message}`);
    }

    console.log('Item updated successfully:', data);
    return data;
  } catch (error) {
    // Log any errors encountered during the request
    console.error('Error in updateItem function:', error);
    throw error;
  }
};

export const deleteItem = async (itemId) => {
  const query = `
    mutation {
      delete_item(item_id: ${itemId}) {
        id
      }
    }`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Check for errors in the response
    if (data.errors) {
      throw new Error(`Error deleting item: ${data.errors[0].message}`);
    }

    console.log('Item deleted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in deleteItem function:', error);
    throw error;
  }
};

export const filterBoardItemsByDate = async (date) => {
  const query = `
    {
      items_page_by_column_values(
        limit: 50, 
        board_id: ${BOARD_ID}, 
        columns: [{ column_id: "date4", column_values: ["${date}"] }]
      ) {
        cursor
        items {
          id
          name
          column_values {
            id
            text
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'API-Version': '2023-04',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();

    // Ensure the response has the correct structure
    const itemsPage = result.data?.items_page_by_column_values;
    if (!itemsPage || itemsPage.items.length === 0) {
      throw new Error('No items found');
    }

    return itemsPage.items;
  } catch (error) {
    console.error('Error filtering board items by date:', error);
    throw error;
  }
};


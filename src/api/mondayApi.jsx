const API_URL = 'https://api.monday.com/v2';
const API_KEY = import.meta.env.VITE_API_KEY;
const BOARD_ID = import.meta.env.VITE_BOARD_ID;

let columnMapCache = null;

const formatTaskFields = (item) => {
  const text = item.column_values.find(col => col.id === columnMapCache['description'])?.text || '';
  const date = item.column_values.find(col => col.id === columnMapCache['date'])?.text || '';
  const status = item.column_values.find(col => col.id === columnMapCache['status'])?.text || '';

  return {
    id: item.id,
    name: item.name,
    text,
    date,
    status,
  };
};

export const fetchBoardItems = async () => {
    const query =  ` query ($boardId: ID!) {
      boards(ids: [$boardId]) {
        name id  
        columns { id title }
        items_page { 
          items { 
            id name 
            column_values{ id text } 
          } 
        } 
      }
    }`;
    const variables = {
      boardId: BOARD_ID, 
    };
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'API-Version': '2023-04',
        },
        body: JSON.stringify({ query, variables }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const boardName = data.data.boards[0].name;
      const columns = data.data.boards[0].columns;
      const items = data.data.boards[0].items_page.items;
      
      if (!columnMapCache) {
        columnMapCache = {};
        columns.forEach(col => {
          columnMapCache[col.title.toLowerCase()] = col.id;
        });
      }
      
      const orderedItems = items.map(task => formatTaskFields(task));
      return { boardName, orderedItems, columnMapCache };
  
    } catch (error) {
      console.error('Error fetching board items:', error);
      throw error;
    }
  };

export const createBoardItem = async ({ name, text, date, status }) => {
  if (!columnMapCache) await fetchBoardItems();
  const query = `mutation ($boardId: ID!, $myItemName: String!, $columnVals: JSON!) 
  { create_item (board_id:$boardId, item_name:$myItemName, column_values:$columnVals) { id } }`;

  const variables = {
    "boardId": BOARD_ID,
    "myItemName": name,
    "columnVals" : JSON.stringify({
      [columnMapCache['description']]: text,
      [columnMapCache['status']]: status,
      [columnMapCache['date']]: date
       
    })
    
  };
  try {
    const response = await fetch("https://api.monday.com/v2", {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${API_KEY}`,

    },
    body: JSON.stringify({ query, variables })
  })
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
  return result.data.create_item.id; 
  } catch (error) {
      console.error('Error creating board item:', error);
      throw error;
  }
}

export const fetchStatusLabels = async() => {
  if (!columnMapCache) {
    await fetchBoardItems();  
  }

  const statusColumnId = columnMapCache?.['status'];
  if (!statusColumnId) {
    console.error('Status column not found in columnMapCache.');
    return [];
  }
  const query = `query ($boardId: ID!) {
    boards(ids: [$boardId]) {
      columns {
        id
        title
        settings_str
      }
    }
  }`

  const variables = { boardId: BOARD_ID};
  try {
    const response = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": API_KEY, 
      },
      body: JSON.stringify({
        query,
        variables
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const statusColumn = data.data.boards[0].columns.find(col => col.id === statusColumnId);
    if (statusColumn) {
      const settings = JSON.parse(statusColumn.settings_str);
      const labelsArray = Object.values(settings.labels);
      const colorsArray = Object.values(settings.labels_colors); 

      const labelsWithColors = labelsArray.map((label, index) => ({
        label,
        color: colorsArray[index] || 'default', 
      }));
      console.log(labelsWithColors)
      return labelsWithColors;
    }
    return [];
  } catch (error) {
    console.error('Error fetching status labels:', error);
    throw error;
  }
};

export const updateItem = async (itemId, columnVals) => {
  const query = `
    mutation ($boardId: ID!, $itemId: ID!, $columnVals: JSON!) {
      change_multiple_column_values( item_id: $itemId, board_id:$boardId , column_values: $columnVals) { id }
    } `;
  const vars = {
    itemId: itemId,
    boardId: BOARD_ID,
    "columnVals" : JSON.stringify({
      name: columnVals.name,
      [columnMapCache['description']]: columnVals.description,
      [columnMapCache['status']]: { label: columnVals.status },
      [columnMapCache['date']]: columnVals.dueDate,
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
    mutation ( $itemId: ID!){
      delete_item( item_id: $itemId) {
        id
      }
    }`;
  const variables = {
    "itemId": itemId, 
  };
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

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
    query ($boardId: ID!, $columnId:String! ,$date: String!) {
      items_page_by_column_values(
        limit: 50, 
        board_id: $boardId,
        columns: [{ column_id: $columnId, column_values: [$date] }]
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
  const variables = {
    boardId: BOARD_ID, 
    columnId: columnMapCache['date'],
    date,    
  };
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'API-Version': '2023-04',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();

    const itemsPage = result.data?.items_page_by_column_values;
    
    if (!itemsPage || itemsPage.items.length === 0) {
      throw new Error('No items found');
    }
    const filteredItems = itemsPage.items.map(formatTaskFields);
    console.log(filteredItems)
    return filteredItems;

  } catch (error) {
    console.error('Error filtering board items by date:', error);
    throw error;
  }
};


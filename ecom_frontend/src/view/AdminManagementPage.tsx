'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Breadcrumb, Button, Modal, Form, Input, message } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import {
  ClientSideRowModelModule,
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
  RowSelectionModule,
  RowSelectionOptions,
  ValidationModule,
  TextEditorModule,
  TextFilterModule,
  DateFilterModule,
  CsvExportModule,
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-theme-alpine.css';
import { themeQuartz, colorSchemeDark } from 'ag-grid-community';
import PORT from '../hooks/usePort';

ModuleRegistry.registerModules([
  RowSelectionModule,
  ClientSideRowModelModule,
  ValidationModule,
  TextEditorModule,
  TextFilterModule,
  DateFilterModule,
  CsvExportModule,
]);

const myDarkTheme = themeQuartz.withPart(colorSchemeDark);
const { Content } = Layout;
const tableNames = ['UserAccount', 'Learners', 'Producer', 'Courses', 'Admin', 'Contact Us Feedback'];

const AdminManagementPage = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<string>('Courses');
  const [rowData, setRowData] = useState<any[]>([]);
  const [gridApi, setGridApi] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTable, setPendingTable] = useState<string | null>(null);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setRowData([]);
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:${PORT}/api/admin/data?table=${encodeURIComponent(selectedTable)}`);
        if (!response.ok) {
          throw new Error(`Error fetching ${selectedTable} data`);
        }
        const data = await response.json();
        setRowData(data);
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error(error);
        message.error('Failed to fetch data from the server.');
      }
    };
    fetchData();
  }, [selectedTable]);

  // Memoized column definitions
  const columnDefs = useMemo<ColDef[]>(() => {
    if (rowData && rowData.length > 0) {
      return Object.keys(rowData[0]).map((key) => ({
        field: key,
        headerName: key.charAt(0).toUpperCase() + key.slice(1),
        editable: true,
        filter: 'agTextColumnFilter',
        sortable: true,
      }));
    }
    return [];
  }, [rowData, selectedTable]);

  const rowSelection = useMemo<RowSelectionOptions>(() => ({ mode: 'multiRow', enableSelectionWithoutKeys: true }), []);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
  }, []);

  const exportSelectedRows = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({ onlySelected: true });
    }
  }, [gridApi]);

  const handleEditClick = () => {
    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length !== 1) {
      message.error('Please select exactly one row to edit.');
      return;
    }
    setEditingRow(selectedRows[0]);
    form.setFieldsValue(selectedRows[0]);
    setIsEditModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const updatedData = rowData.map((row) =>
        row.id === editingRow.id ? { ...row, ...values } : row
      );
      setRowData(updatedData);
      setHasUnsavedChanges(false);
      const response = await fetch(`http://localhost:${PORT}/api/admin/data?table=${encodeURIComponent(selectedTable)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingRow.id, ...values }),
      });
      if (!response.ok) {
        throw new Error('Failed to update the data on the server.');
      }
      message.success('Data updated successfully.');
      setIsEditModalVisible(false);
    } catch (error) {
      console.error(error);
      message.error('Failed to update data.');
    }
  };

  const handleModalCancel = () => {
    setIsEditModalVisible(false);
  };

  // const onCellValueChanged = useCallback(() => {
  //   setHasUnsavedChanges(true);
  // }, []);

  const handleTableChange = (newTable: string) => {
    if (hasUnsavedChanges) {
      setPendingTable(newTable);
      setIsConfirmModalVisible(true);
    } else {
      setSelectedTable(newTable);
    }
  };

  const handleConfirmSave = async () => {
    try {
      await handleModalOk();
      setSelectedTable(pendingTable as string);
      setPendingTable(null);
      setIsConfirmModalVisible(false);
    } catch (error) {
      message.error('Failed to save changes.');
    }
  };

  const handleConfirmDiscard = () => {
    setHasUnsavedChanges(false);
    setSelectedTable(pendingTable as string);
    setPendingTable(null);
    setIsConfirmModalVisible(false);
  };

  // Inline editing is now done directly in the grid.
  // Enable single click editing for Learners, Producer, and Courses.
  // const enableSingleClickEdit =
  //   selectedTable === 'Learners' || selectedTable === 'Producer' || selectedTable === 'Courses';

  // const onCellValueChanged = useCallback(
  //   (event: CellValueChangedEvent) => {
  //     if (event.rowIndex === null) return; // or handle null case appropriately
  //     const updatedData = [...rowData];
  //     updatedData[event.rowIndex] = event.data;
  //     setRowData(updatedData);
  //     message.success('Data updated successfully.');
  //   },
  //   [rowData]
  // );

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`http://localhost:${PORT}/api/admin/data?table=${encodeURIComponent(selectedTable)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: rowData }),
      });
      if (!response.ok) {
        throw new Error();
      }
      if (response.ok) {
        message.success('Changes saved successfully.');
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      message.error('Failed to save changes.');
    }
  };

  const handleDeleteAdmins = async () => {
    const selectedRows = gridApi?.getSelectedRows();
  
    if (!selectedRows || selectedRows.length === 0) {
      message.warning('Please select at least one admin to delete.');
      return;
    }
  
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete ${selectedRows.length} admin(s)?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          for (const admin of selectedRows) {
            const userId = admin.user_id || admin.id; // fallback just in case
            console.log("Deleting admin with ID:", userId);
            if (!userId) {
              console.warn('No user_id found for row:', admin);
              continue;
            }
  
            const res = await fetch(`http://localhost:${PORT}/api/useraccounts/${userId}`, {
              method: 'DELETE',
            });
  
            const result = await res.json();
  
            if (!res.ok) {
              message.error(result.error || 'Failed to delete admin');
              continue;
            }
          }
  
          message.success('Admin(s) deleted successfully.');
        
  
          // Refresh table
          const response = await fetch(`http://localhost:${PORT}/api/admin/data?table=Admin`);
          const data = await response.json();
          setRowData(data);
        } catch (err) {
          console.error('Delete error:', err);
          message.error('An error occurred while deleting admins.');
        }
      },
    });
  };  

  return (
    <Layout style={{ minHeight: '100vh', background: '#141414' }}>
      <Content style={{ padding: '24px' }}>
        <Breadcrumb style={{ marginBottom: '16px', color: '#fff' }}>
          {tableNames.map((item) => (
            <Breadcrumb.Item key={item}>
              <a onClick={() => handleTableChange(item)} style={{ color: selectedTable === item ? '#1890ff' : '#fff' }}>
                {item}
              </a>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        {selectedTable === 'Admin' && (
          <Button
            onClick={() => navigate('/adminCreation')}
            type="primary"
            style={{ marginBottom: 16, marginRight: '5px' }}
          >
            Create New Admin Account
          </Button>
        )}
        <Button onClick={exportSelectedRows} type="primary" style={{ marginBottom: 16, marginRight: '5px'}}>
          Export Selected Rows as CSV
        </Button>
        <Button onClick={handleSaveChanges} type="primary" style={{ marginBottom: 16, marginRight: '5px' }}>
          Save Changes
        </Button>
        {selectedTable === 'Admin' && (
          <Button
            danger
            onClick={handleDeleteAdmins}
            style={{ marginBottom: 16, marginRight: '5px' }}
          >
            Delete Selected Admin(s)
          </Button>
        )}
        <div style={{ overflowX: 'auto' }}>
          <div className="aggrid_div" style={{ height: 500, minWidth: '1500px' }}>
            <AgGridReact
              theme={myDarkTheme}
              columnDefs={columnDefs}
              rowData={rowData}
              defaultColDef={{ flex: 1, resizable: true, sortable: true, filter: true }}
              rowSelection={rowSelection}
              onGridReady={onGridReady}
              rowHeight={30}
              getRowId={(params) => params.data.user_id?.toString()}
              // onCellValueChanged={onCellValueChanged}
              // singleClickEdit={enableSingleClickEdit}
            // onCellValueChanged={onCellValueChanged}
            onSelectionChanged={(params) => {
                const selectedRows = params.api.getSelectedRows();
                console.log('Selected Rows:', selectedRows);
              }}
            />
          </div>
        </div>
        <Card title="Raw Data (Debug)" style={{ marginTop: 16, backgroundColor: '#1f1f1f', color: '#ffffff' }} styles={{ header: { color: '#fff' } }}>
          <pre style={{ color: '#fff' }}>{JSON.stringify(rowData, null, 2)}</pre>
        </Card>
        <Modal title="Edit Details" open={isEditModalVisible} onOk={handleModalOk} onCancel={handleModalCancel}>
          <Form form={form} layout="vertical">
            {selectedTable === 'Learners' && (
              <>
                <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter a name' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter an email' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Enrollment Date" name="enrollmentDate" rules={[{ required: true, message: 'Please enter the enrollment date' }]}>
                  <Input />
                </Form.Item>
              </>
            )}
            {selectedTable === 'Producer' && (
              <>
                <Form.Item label="Producer Name" name="producerName" rules={[{ required: true, message: 'Please enter the producer name' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Contact" name="contact" rules={[{ required: true, message: 'Please enter the contact info' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Website" name="website" rules={[{ required: true, message: 'Please enter the website' }]}>
                  <Input />
                </Form.Item>
              </>
            )}
            {selectedTable === 'Courses' && (
              <>
                <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter the course title' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Instructor" name="instructor" rules={[{ required: true, message: 'Please enter the instructor name' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Category" name="category" rules={[{ required: true, message: 'Please enter the category' }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Date" name="date" rules={[{ required: true, message: 'Please enter the course date' }]}>
                  <Input />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
        <Modal
          title="Unsaved Changes"
          open={isConfirmModalVisible}
          onCancel={() => setIsConfirmModalVisible(false)}
          footer={[
            <Button key="discard" onClick={handleConfirmDiscard}>
              Discard Changes
            </Button>,
            <Button key="save" type="primary" onClick={handleConfirmSave}>
              Save Changes
            </Button>,
          ]}
        >
          <p>You have unsaved changes. Do you want to save them before switching tables? If you don't save, your changes will be lost.</p>
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminManagementPage;

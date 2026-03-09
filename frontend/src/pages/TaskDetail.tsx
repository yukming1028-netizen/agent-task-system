import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Descriptions, Tag, Typography, Divider, message, Space } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { taskService } from '../services/task.service';
import { authService } from '../services/auth.service';
import type { Task } from '../types';

const { Title, Paragraph } = Typography;

interface TaskWithHistory extends Task {
  history?: Array<{
    id: number;
    action: string;
    newValue?: string;
    createdAt: string;
    user?: {
      username: string;
      displayName?: string;
    };
  }>;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskWithHistory | null>(null);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (id) {
      loadTask();
    }
  }, [id]);

  const loadTask = async () => {
    try {
      const data = await taskService.getById(parseInt(id!));
      setTask(data);
    } catch (error: any) {
      message.error('Failed to load task');
    }
  };

  const handleComplete = async () => {
    try {
      await taskService.updateStatus(parseInt(id!), 'completed');
      message.success('Task completed!');
      loadTask();
    } catch (error: any) {
      message.error('Failed to complete task');
    }
  };

  const handleClaim = async () => {
    try {
      await taskService.claim(parseInt(id!));
      message.success('Task claimed!');
      loadTask();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to claim task');
    }
  };

  if (!task) return null;

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'default',
      in_progress: 'processing',
      completed: 'success',
      review: 'warning',
    };
    return colors[status] || 'default';
  };

  const canComplete = user?.role !== 'manager' && task.assignedTo === user?.id && task.status === 'in_progress';
  const canClaim = !task.assignedTo && user?.role !== 'manager';

  return (
    <div style={{ padding: 24 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/dashboard')} style={{ marginBottom: 16 }}>
        Back to Dashboard
      </Button>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>{task.title}</Title>
            <Space>
              <Tag color={getStatusColor(task.status)}>{task.status.toUpperCase()}</Tag>
              <Tag>{task.taskType.toUpperCase()}</Tag>
              <Tag color={task.priority === 'high' || task.priority === 'urgent' ? 'error' : 'default'}>
                {task.priority.toUpperCase()}
              </Tag>
            </Space>
          </div>
          <Space>
            {canClaim && (
              <Button type="primary" onClick={handleClaim}>
                Claim Task
              </Button>
            )}
            {canComplete && (
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleComplete}>
                Complete Task
              </Button>
            )}
          </Space>
        </div>

        <Descriptions bordered column={2}>
          <Descriptions.Item label="Created By">
            {task.creator?.displayName || task.creator?.username}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned To">
            {task.assignee?.displayName || task.assignee?.username || 'Unassigned'}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(task.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'Not set'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={4}>Description</Title>
        <Paragraph>{task.description || 'No description provided.'}</Paragraph>

        {task.history && task.history.length > 0 && (
          <>
            <Divider />
            <Title level={4}>Activity History</Title>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {task.history.map((h, idx) => (
                <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 14 }}>
                    <strong>{h.user?.displayName || h.user?.username}</strong> {h.action}
                    {h.newValue && ` → ${h.newValue}`}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default TaskDetail;

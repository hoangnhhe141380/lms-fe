import React, { useState, useEffect } from 'react'
import { Button, Input, Pagination, Select, Space, Table, Tag, Typography } from 'antd'

import submitApi from '~/api/submitApi'
import { useSelector } from 'react-redux'
import Tooltip from 'antd/es/tooltip'
import { CrownTwoTone, EyeOutlined, FormOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const Group = () => {
  let ITEM_PER_PAGE = 10
  const { currentClass, username, roles } = useSelector((state) => state.profile)
  const navigateTo = useNavigate()

  const [loading, setLoading] = useState(false)

  const [tableData, setTableData] = useState({
    listData: [],
    currentPage: 1,
    totalItem: 1,
  })

  const [listFilter, setListFilter] = useState([])
  const [filter, setFilter] = useState({ milestoneId: 0 })
  const [isTrainer, setIsTrainer] = useState(false)

  useEffect(() => {
    console.log(username)
    if (roles.includes('trainer')) {
      setIsTrainer(true)
    }
    const params = {
      isGroup: true,
    }
    submitApi
      .getListfilter(currentClass, params)
      .then((response) => {
        console.log(response)
        setListFilter(response)
      })
      .catch((error) => {
        console.log(error)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClass])

  useEffect(() => {
    setFilter((prev) => ({ ...prev, search: undefined, milestoneId: 0 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClass])

  useEffect(() => {
    loadData(tableData.currentPage, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const loadData = async (page, filter) => {
    const params = {
      limit: ITEM_PER_PAGE,
      page: page,
      isGroup: true,
      milestoneId: filter?.milestoneId,
      statusValue: filter?.statusId,
      q: filter?.search?.trim(),
    }

    setLoading(true)

    await submitApi
      .getListSubmit(currentClass, params)
      .then((response) => {
        console.log(response)
        setTableData((prev) => ({
          ...prev,
          listData: response.listResult,
          currentPage: response.page,
          totalItem: response.totalItem,
        }))
      })
      .then(() => setLoading(false))
      .catch((error) => {
        setLoading(false)
        console.log(error)
      })
  }

  const handleChangePage = (pageNumber) => {
    setTableData((prev) => ({ ...prev, currentPage: pageNumber }))
    loadData(pageNumber, filter)
  }

  const columns = [
    { title: '#', dataIndex: 'submitId', width: '6%' },
    { title: 'Trainee', dataIndex: 'traineeTitle', width: '14.5%' },
    { title: 'Full Name', dataIndex: 'fullName', width: '14.5%' },
    {
      title: 'Group',
      dataIndex: 'group',
      width: '10%',

      render: (_, { group }) => (
        <Tooltip
          title={
            <>
              {group?.memberId?.map((member) => (
                <Space className="d-flex flex-row">
                  <p className="p-0 m-0 d-flex align-items-center">{member?.username}</p>
                  <p className="p-0 m-0 d-flex align-items-center">{member?.leader && <CrownTwoTone />}</p>
                </Space>
              ))}
            </>
          }
        >
          <Typography.Text>{group.groupName}</Typography.Text>
        </Tooltip>
      ),
    },
    { title: 'Milestone', dataIndex: 'milestoneTitle', width: '15%' },
    {
      title: 'Submit File',
      dataIndex: 'submitUrl',
      width: '10%',
      ellipsis: true,
      render: (_, { submitUrl, group }) => {
        const listUsername = group?.memberId?.map((item) => item.username)
        const isDownloadable = listUsername?.includes(username) || roles.includes('trainer')
        return isDownloadable ? (
          <Typography.Link href={submitUrl} target="_blank">
            {submitUrl?.slice(
              submitUrl?.lastIndexOf('https://lms-assignment-g23.s3.ap-southeast-1.amazonaws.com') + 59,
              submitUrl?.length,
            )}
          </Typography.Link>
        ) : (
          <Typography.Text>-</Typography.Text>
        )
      },
    },
    {
      title: 'Submit At',
      dataIndex: 'lastUpdate',
      width: '10%',
      render: (_, { lastUpdate }) => lastUpdate?.slice(0, -5),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '7.5%',
      render: (_, { status }) => (
        <Tag color={status === 'Pending' ? 'green' : status === 'Submitted' ? 'blue' : 'purple'}> {status}</Tag>
      ),
    },
    {
      title: 'Actions',
      dataIndex: '',
      width: '12.5%',
      render: (_, submit) => (
        <Space size="middle" align="baseline">
          {!isTrainer && username === submit.traineeTitle && submit.status !== 'Evaluated' && (
            <Tooltip title="Submit Milestone" placement="top">
              <Button
                shape="circle"
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => {
                  navigateTo(`/new-submit/${submit.submitId}`)
                }}
              ></Button>
            </Tooltip>
          )}

          {submit.status === 'Evaluated' && (
            <Tooltip title="View Evaluate" placement="top">
              <Button
                shape="circle"
                type="primary"
                icon={<FormOutlined />}
                onClick={() => {
                  navigateTo(`/assignment-evaluation/${submit.milestoneId}/${submit.group.groupId}`)
                }}
              ></Button>
            </Tooltip>
          )}
          <Tooltip title="View Detail" placement="top">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => {
                navigateTo(`/submit-detail/${submit.submitId}`)
              }}
            ></Button>
          </Tooltip>
        </Space>
      ),
    },
  ].filter((item) => !item.hidden)

  const customLocaleWhenEmpty = {
    emptyText: filter?.milestoneId !== null ? 'No Data' : 'Select Milestone To Load Submit',
  }

  return (
    <div className="widget-inner">
      <div className="row">
        <div className="col-lg-12 m-b30">
          <div className="row">
            <div className="col-lg-6">
              <Input.Search
                placeholder="Input text to search trainee"
                onSearch={(value) => setFilter((prev) => ({ ...prev, search: value }))}
                allowClear
                onClear={() => setFilter((prev) => ({ ...prev, search: undefined }))}
              />
            </div>
            <div className="col-lg-2">
              <Select
                className="w-100"
                placeholder="Select Status"
                options={listFilter?.statusFilter?.map((status) => ({
                  value: status.value,
                  label: status.name,
                }))}
                value={filter?.statusId}
                onChange={(value) => setFilter((prev) => ({ ...prev, statusId: value }))}
                allowClear
                onClear={() => setFilter((prev) => ({ ...prev, statusId: undefined }))}
              ></Select>
            </div>
            <div className="col-lg-4">
              <Select
                className="w-100"
                placeholder="Select Milestone"
                options={listFilter?.milestoneFilter?.map((milestone) => ({
                  value: milestone.milestoneId,
                  label: milestone.milestoneTitle,
                }))}
                value={filter?.milestoneId}
                onChange={(value) => setFilter((prev) => ({ ...prev, milestoneId: value }))}
              ></Select>
            </div>
          </div>
        </div>
        <div className="col-lg-12 m-b30">
          <Table
            dataSource={tableData.listData}
            columns={columns}
            loading={loading}
            locale={customLocaleWhenEmpty}
            pagination={false}
          />
          <div className="d-flex justify-content-end mt-3">
            <Pagination
              current={tableData.currentPage}
              total={tableData.totalItem}
              onChange={handleChangePage}
              showSizeChanger
              onShowSizeChange={(current, pageSize) => {
                ITEM_PER_PAGE = pageSize
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Group

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Breadcrumb, Button, Modal, Pagination, Space, Table, Tag, Tooltip } from 'antd'
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons'

import { CButton, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilSearch, cilSync } from '@coreui/icons'

import classEvalCriteriaApi from '~/api/classEvalCriteriaApi'

import AdminHeader from '~/components/AdminDashboard/AdminHeader'
import AdminSidebar from '~/components/AdminDashboard/AdminSidebar'
import AdminFooter from '~/components/AdminDashboard/AdminFooter'

const ClassEvalCriteriaList = () => {
  const ITEM_PER_PAGE = 10
  const { currentClass } = useSelector((state) => state.profile)

  const navigateTo = useNavigate()

  const [listClassSetting, setListClassSetting] = useState([])
  const [totalItem, setTotalItem] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const [search, setSearch] = useState('')
  const [listFilter, setListFilter] = useState({
    milestoneFilter: [],
    statusFilter: [],
  })
  const [filter, setFilter] = useState({
    milestone: {
      title: 'Select Milestone',
      value: '',
    },
    status: {
      name: 'Select Status',
      value: '',
    },
  })

  useEffect(() => {
    classEvalCriteriaApi
      .getFilter()
      .then((response) => {
        setListFilter((prev) => ({
          ...prev,
          milestoneFilter: response.milestoneFilter,
          statusFilter: response.statusFilter,
        }))
      })
      .catch((error) => {
        console.log(error)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadData(1, filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, currentClass])

  const loadData = async (page, filter, q = '') => {
    const params = { limit: ITEM_PER_PAGE, page: page, filterClass: currentClass }
    if (q !== '') {
      params.q = q.trim()
    }
    if (filter.milestone.title !== 'Select Milestone') {
      params.filterMilestone = filter.milestone.title
    }
    if (filter.status.name !== 'Select Status') {
      params.filterStatus = filter.status.value
    }
    await classEvalCriteriaApi
      .getPage(params)
      .then((response) => {
        console.log(response)
        setListClassSetting(response.listResult)
        setCurrentPage(page)
        setTotalItem(response.totalItem)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const handleSearch = () => {
    loadData(1, filter, search)
  }

  const handleFilterMilestone = (type) => {
    setFilter((prev) => ({ ...prev, type: type }))
  }

  const handleFilterStatus = (status) => {
    setFilter((prev) => ({ ...prev, status: status }))
  }

  const handleChangePage = (pageNumber) => {
    setCurrentPage(pageNumber)
    loadData(pageNumber, filter)
  }

  const handleReload = () => {
    setSearch('')
    setFilter({
      milestone: {
        title: 'Select Milestone',
        value: '',
      },
      status: {
        name: 'Select Status',
        value: '',
      },
    })
  }

  const handleAdd = () => {
    navigateTo(`/class-criteria-add`)
  }

  const handleActive = async (id) => {
    await classEvalCriteriaApi
      .changeStatus(id)
      .then(() => {
        loadData(currentPage, filter)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subjectName',
      sorter: (a, b) => a.subjectName.length - b.subjectName.length,
      width: '7.5%',
    },
    {
      title: 'Milestone',
      dataIndex: 'milestone',
      sorter: (a, b) => a.milestone.length - b.milestone.length,
      width: '12.5%',
    },
    {
      title: 'Assignment',
      dataIndex: 'assignment',
      sorter: (a, b) => a.assignment.length - b.assignment.length,
      width: '15%',
      render: (_, { assignment }) => assignment.title,
    },
    {
      title: 'Name',
      dataIndex: 'criteriaName',
      sorter: (a, b) => a.criteriaName.length - b.criteriaName.length,
      width: '15%',
    },
    {
      title: 'Expected Work',
      dataIndex: 'expectedWork',
      sorter: (a, b) => a.expectedWork.length - b.expectedWork.length,
      width: '17.5%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '10%',
      sorter: (a, b) => a.status?.length - b.status?.length,
      render: (_, { status }) => (
        <Tag color={status === 'Active' ? 'blue' : status === 'Inactive' ? 'red' : 'grey'} key={status}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Eval Weight',
      dataIndex: 'evalWeight',
      sorter: (a, b) => a.evalWeight.length - b.evalWeight.length,
      width: '10%',
    },
    {
      title: 'Is Teameval',
      dataIndex: 'isTeamEval',
      sorter: (a, b) => a.isTeamEval - b.isTeamEval,
      width: '10%',
      render: (_, { isTeamEval }) => (isTeamEval === 1 ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      width: '10%',
      render: (_, subject) => (
        <Space size="middle" align="baseline">
          <Tooltip title={subject.status === 'Active' ? 'Deactivate' : 'Reactivate'} placement="top">
            <Button
              type={subject.status === 'Active' ? 'danger' : 'primary'}
              shape="circle"
              icon={subject.status === 'Active' ? <CloseOutlined /> : <CheckOutlined />}
              onClick={() => {
                modalConfirm(subject)
              }}
            ></Button>
          </Tooltip>
          <Tooltip title="View" placement="top">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => {
                navigateTo(`/class-criteria-detail/${subject?.criteriaId}`)
              }}
            ></Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  const modalConfirm = (subject) => {
    Modal.confirm({
      title: `Are you want to ${subject.classSettingId === 'Active' ? 'deactivate' : 'reactivate'} "${
        subject.milestone
      }" - "${subject.criteriaName}" ?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'OK',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk() {
        handleActive(subject.criteriaId)
      },
      onCancel() {},
    })
  }

  return (
    <div>
      <AdminSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AdminHeader />
        <div className="body flex-grow-1 px-3">
          <div className="col-lg-12 m-b30">
            <div className="row">
              <div className="col-lg-12 m-b30">
                <div className="row">
                  <div className="col-3 d-flex align-items-center">
                    <Breadcrumb>
                      <Breadcrumb.Item>
                        <Link to="/dashboard">Dashboard</Link>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>Class Eval Criteria List</Breadcrumb.Item>
                    </Breadcrumb>
                  </div>
                  <div className="col-4 d-flex w-80">
                    <input
                      type="search"
                      id="form1"
                      className="form-control"
                      placeholder="Searching by Title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <CButton color="primary" type="submit" className="text-light ml-10" onClick={handleSearch}>
                      <CIcon icon={cilSearch} />
                    </CButton>
                  </div>
                  <div className="col-5 d-flex justify-content-end">
                    <CDropdown className="ml-4">
                      <CDropdownToggle color="secondary">{filter.milestone.title}</CDropdownToggle>
                      <CDropdownMenu style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {listFilter.milestoneFilter.map((milestone) => (
                          <CDropdownItem onClick={() => handleFilterMilestone(milestone)}>
                            {milestone.title}
                          </CDropdownItem>
                        ))}
                      </CDropdownMenu>
                    </CDropdown>
                    <CDropdown className="ml-4">
                      <CDropdownToggle color="secondary">{filter.status.name}</CDropdownToggle>
                      <CDropdownMenu style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {listFilter.statusFilter.map((status) => (
                          <CDropdownItem onClick={() => handleFilterStatus(status)}>{status.name}</CDropdownItem>
                        ))}
                      </CDropdownMenu>
                    </CDropdown>
                    <Tooltip title="Reload" placement="top">
                      <CButton color="success" type="submit" className="text-light ml-4" onClick={handleReload}>
                        <CIcon icon={cilSync} />
                      </CButton>
                    </Tooltip>
                    <Tooltip title="Add New Class Eval Criteria" placement="right">
                      <CButton color="danger" type="submit" className="text-light ml-4" onClick={handleAdd}>
                        <CIcon icon={cilPlus} />
                      </CButton>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <div className="col-lg-12">
                <Table bordered dataSource={listClassSetting} columns={columns} pagination={false} />
              </div>
              <div className="col-lg-12 d-flex justify-content-end">
                <Pagination current={currentPage} total={totalItem} onChange={handleChangePage} />;
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default ClassEvalCriteriaList

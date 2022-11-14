import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { Button, Input, message, Modal, Pagination, Select, Table, Tag, Typography, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import styled from 'styled-components'

import submitApi from '~/api/submitApi'

import AdminHeader from '~/components/AdminDashboard/AdminHeader'
import AdminSidebar from '~/components/AdminDashboard/AdminSidebar'
import AdminFooter from '~/components/AdminDashboard/AdminFooter'
import moment from 'moment'

const StyledUpload = styled(Upload)`
  display: flex;
  flex-direction: row-reverse;
`

const NewSubmit = () => {
  const { id } = useParams()
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const [listSubmitFilter, setListSubmitFilter] = useState([])
  // const [requirementSelected, setRequirementSelected] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [zipFile, setZipFile] = useState(null)

  useEffect(() => {
    submitApi
      .getListSubmitFilter(id)
      .then((response) => {
        console.log(response)
        setListSubmitFilter({
          ...response,
          requirement: response?.requirement?.map((req, index) => ({ ...req, key: index })),
        })
      })
      .catch((error) => {
        console.log(error)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const handleChangeRequirement = (value) => {
  //   setRequirementSelected(value)
  // }

  const toastMessage = (type, mes) => {
    message[type]({
      content: mes,
      style: {
        transform: `translate(0, 8vh)`,
      },
    })
  }

  const props = {
    name: 'file',
    accept: '.zip',
    multiple: false,
    maxCount: 1,
    beforeUpload: () => {
      return false
    },
    onChange(info) {
      const { status } = info.file
      const extensionFile = info.file.name.split('.').pop()

      if (status !== 'uploading') {
        if (info.file.status === 'removed') return
        if (!['zip'].includes(extensionFile)) {
          toastMessage('error', 'File type is invalid (support .zip only)')
          return
        }
        //File bigger than 10MB
        if (info.file.size >= 10000000) {
          toastMessage('error', 'File must smaller than 10MB')
          return
        }
        toastMessage('success', `${info.file.name} file uploaded successfully.`)

        const formData = new FormData()
        formData.append('file', info.file)

        setZipFile(formData.values().next().value)
      }
    },
    onRemove(e) {
      console.log('Remove files', e)
      setZipFile(null)
    },
  }

  // const handleSubmit = async () => {
  //   if (requirementSelected.length === 0) {
  //     toastMessage('error', 'You must select at lease one requirement')
  //     return
  //   }
  //   if (zipFile === null) {
  //     toastMessage('error', 'You must choose file to submit')
  //     return
  //   }

  //   const params = {
  //     requirementIds: btoa(JSON.stringify({ requirementIds: requirementSelected })),
  //     submitFile: zipFile,
  //   }

  //   console.log(params)
  //   submitApi
  //     .submitFile(id, params)
  //     .then((response) => {
  //       toastMessage('success', `Submit file successfully`)
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //       toastMessage('error', `Submit file failed, try again please`)
  //     })
  // }

  const columns = [
    { title: 'Requirement', dataIndex: 'title', width: '60%' },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '20%',
      render: (_, { status }) => <Tag color="green">{status}</Tag>,
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      width: '20%',
      render: (_, { assignee }) => (
        <Select
          className="w-100"
          allowClear
          value={assignee}
          options={listSubmitFilter?.assigneeOfGroup?.map((ass) => ({
            label: ass?.username,
            value: ass?.username,
          }))}
          placeholder="Select Assignee"
        />
      ),
    },
  ]

  return (
    <div>
      <AdminSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AdminHeader />
        <div className="body flex-grow-1 px-3">
          <div className="col-lg-12">
            <div className="row">
              <div className="row">
                <div className="col-lg-12 p-b20">
                  <div className="row mt-3">
                    <div className="col-8 d-flex justify-content-start">
                      {listSubmitFilter?.status === 'Pending' ? (
                        <></>
                      ) : (
                        <>
                          <Typography.Text>{`Lastest submitted:`}</Typography.Text>
                          <Typography.Link className="mx-1">
                            {listSubmitFilter?.currentSubmitUrl?.slice(
                              listSubmitFilter?.currentSubmitUrl?.lastIndexOf(
                                'https://lms-assignment-g23.s3.ap-southeast-1.amazonaws.com',
                              ) + 59,
                              listSubmitFilter?.currentSubmitUrl?.length,
                            )}
                          </Typography.Link>
                          <Typography.Text>{`at ${moment(
                            listSubmitFilter?.lastSubmit,
                            'YYYY-MM-DD hh:mm:ss',
                          )}`}</Typography.Text>
                        </>
                      )}
                    </div>
                    <div className="col-4 d-flex justify-content-end">
                      <Typography.Text>{`Choose submit package (zip file, <= 20MB)`}</Typography.Text>
                    </div>
                    <div className="col-4 d-flex">
                      <Input value={listSubmitFilter?.milestone} readOnly />
                    </div>
                    <div className="col-6 d-flex">
                      {/* <Typography.Text>{`Lastest submitted:`}</Typography.Text>
                      <Typography.Link className="mx-1">
                        {listSubmitFilter?.currentSubmitUrl?.slice(
                          listSubmitFilter?.currentSubmitUrl?.lastIndexOf(
                            'https://lms-assignment-g23.s3.ap-southeast-1.amazonaws.com',
                          ) + 59,
                          listSubmitFilter?.currentSubmitUrl?.length,
                        )}
                      </Typography.Link>
                      <Typography.Text>{`at ${moment(
                        listSubmitFilter?.lastSubmit,
                        'YYYY-MM-DD hh:mm:ss',
                      )}`}</Typography.Text> */}
                    </div>
                    <div className="col-2 d-flex justify-content-end">
                      <StyledUpload
                        {...props}
                        style={{ display: 'flex !important', flexDirection: 'row-reverse !important' }}
                      >
                        <Button icon={<UploadOutlined />}>Click to Upload</Button>
                      </StyledUpload>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 m-b10">
                  <div className="row">
                    <div className="col-8 d-flex justify-content-start">
                      <Typography.Text strong>{`Found ${
                        listSubmitFilter?.requirement?.length ?? 0
                      } requirements which you can choose to submit`}</Typography.Text>
                    </div>
                    <div className="col-4 d-flex justify-content-end">
                      <Button type="link" onClick={() => setOpen(true)}>
                        Update Requirement
                      </Button>
                      <Modal
                        title="Requirement Update"
                        style={{
                          left: 30,
                        }}
                        centered
                        maskClosable={false}
                        open={open}
                        onOk={() => setOpen(false)}
                        onCancel={() => setOpen(false)}
                        width={'85%'}
                        footer={[
                          <Button key="submit" type="primary" onClick={() => setOpen(false)}>
                            Submit
                          </Button>,

                          <Button key="back" type="secondary" onClick={() => setOpen(false)}>
                            Cancel
                          </Button>,
                        ]}
                      >
                        <div className="col-lg-12">
                          <div className="row">
                            <div className="col-lg-6">
                              <Input.Search placeholder="Input text to search trainee" allowClear />
                            </div>
                            <div className="col-lg-2">
                              <Select className="w-100" placeholder="Select Status" allowClear />
                            </div>
                            <div className="col-lg-4">
                              <Select className="w-100" placeholder="Select Milestone" allowClear />
                            </div>
                          </div>
                          <div className="col-lg-12 m-b10">Table Modal Here</div>
                          <div className="col-lg-12 p-0 d-flex justify-content-end">
                            <Button className="m-0" type="primary" onClick={() => setOpen(false)}>
                              Reset
                            </Button>
                          </div>
                        </div>
                      </Modal>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="row">
                    <Table
                      columns={columns}
                      dataSource={listSubmitFilter?.requirement}
                      pagination={false}
                      loading={loading}
                      rowSelection={{
                        defaultSelectedRowKeys: () => {
                          const result = listSubmitFilter?.requirement?.map((req) => (req.submitted ? req.id : null))
                          console.log(result)
                          return result
                        },
                        type: 'checkbox',
                        onChange: (selectedRowKeys, selectedRows) => {
                          console.log(selectedRowKeys, selectedRows)
                        },
                      }}
                    />
                  </div>
                </div>
                <div className="col-lg-12 mt-3">
                  <div className="row ">
                    <div className="col-lg-3 d-flex justify-content-start">
                      <Button type="primary">Submit Milestone</Button>
                    </div>
                    <div className="col-lg-9 d-flex justify-content-end">
                      <Pagination />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    </div>
  )
}

export default NewSubmit
